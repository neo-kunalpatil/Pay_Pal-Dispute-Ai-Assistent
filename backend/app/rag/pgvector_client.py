import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text, or_, and_
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.core.config import settings

class PgVectorClient:
    """Neon PostgreSQL + pgvector RAG Client with Semantic, Keyword, and Hybrid Search"""

    def ensure_extension(self, db: Session):
        """Enable pgvector extension on PostgreSQL"""
        if "postgresql" in settings.DATABASE_URL:
            try:
                db.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                # Create HNSW index for cosine distance if not exists
                db.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
                    ON document_chunks
                    USING hnsw (embedding vector_cosine_ops);
                """))
                db.commit()
            except Exception as exc:
                db.rollback()

    def store_chunks(self, db: Session, chunks_data: List[Dict[str, Any]]) -> int:
        """Stores or re-indexes document chunks in PostgreSQL with pgvector embeddings"""
        if not chunks_data:
            return 0

        # Remove existing chunks for this document to prevent duplicate indexing
        doc_id = chunks_data[0].get("document_id")
        merchant_id = chunks_data[0].get("merchant_id")
        if doc_id and merchant_id:
            db.query(DocumentChunk).filter(
                DocumentChunk.merchant_id == merchant_id,
                DocumentChunk.document_id == doc_id
            ).delete()

        created_count = 0
        for chk in chunks_data:
            chunk_record = DocumentChunk(
                merchant_id=chk["merchant_id"],
                document_id=chk["document_id"],
                dispute_id=chk.get("dispute_id"),
                chunk_index=chk.get("chunk_index", 1),
                chunk_text=chk["content"],
                embedding=chk.get("embedding"),
                page_number=chk.get("page_number", 1),
                document_category=chk["document_category"],
                chunk_metadata={
                    "filename": chk.get("filename"),
                    "category": chk.get("document_category")
                }
            )
            db.add(chunk_record)
            created_count += 1

        db.commit()
        return created_count

    def search_semantic(
        self,
        db: Session,
        merchant_id: str,
        query_vector: List[float],
        dispute_id: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Semantic vector similarity search using pgvector cosine distance.
        Enforces strict merchant_id tenant isolation.
        """
        results = []
        is_postgres = "postgresql" in settings.DATABASE_URL

        if is_postgres:
            try:
                # Use pgvector cosine distance operator <=>
                vec_str = "[" + ",".join(str(v) for v in query_vector) + "]"
                query_sql = """
                    SELECT 
                        c.id, c.document_id, c.dispute_id, c.chunk_text, c.page_number, 
                        c.document_category, c.metadata, d.filename,
                        (1 - (c.embedding <=> :vec::vector)) as similarity
                    FROM document_chunks c
                    JOIN documents d ON c.document_id = d.id
                    WHERE c.merchant_id = :merchant_id
                """
                params = {"merchant_id": merchant_id, "vec": vec_str, "top_k": top_k}
                if dispute_id:
                    query_sql += " AND (c.dispute_id = :dispute_id OR c.dispute_id IS NULL)"
                    params["dispute_id"] = dispute_id
                if category and category != "ALL":
                    query_sql += " AND c.document_category = :category"
                    params["category"] = category

                query_sql += " ORDER BY c.embedding <=> :vec::vector ASC LIMIT :top_k"
                
                rows = db.execute(text(query_sql), params).fetchall()
                for r in rows:
                    results.append({
                        "id": r[0],
                        "document_id": r[1],
                        "dispute_id": r[2],
                        "content": r[3],
                        "page_number": r[4],
                        "document_category": r[5],
                        "filename": r[7] or (r[6].get("filename") if r[6] else "Document"),
                        "score": round(float(r[8] if r[8] is not None else 1.0), 4)
                    })
                return results
            except Exception:
                db.rollback()

        # Portable cosine similarity fallback for SQLite/non-pgvector testing
        chunks = db.query(DocumentChunk).filter(DocumentChunk.merchant_id == merchant_id)
        if category and category != "ALL":
            chunks = chunks.filter(DocumentChunk.document_category == category)
        all_chunks = chunks.all()

        scored = []
        for chk in all_chunks:
            doc_vec = chk.embedding
            if isinstance(doc_vec, list) and len(doc_vec) == len(query_vector):
                dot = sum(a * b for a, b in zip(query_vector, doc_vec))
                mag1 = math.sqrt(sum(a * a for a in query_vector)) or 1.0
                mag2 = math.sqrt(sum(b * b for b in doc_vec)) or 1.0
                sim = max(0.0, dot / (mag1 * mag2))
            else:
                sim = 0.5

            doc_name = chk.chunk_metadata.get("filename") if chk.chunk_metadata else "Document"
            scored.append({
                "id": chk.id,
                "document_id": chk.document_id,
                "dispute_id": chk.dispute_id,
                "content": chk.chunk_text,
                "page_number": chk.page_number,
                "document_category": chk.document_category,
                "filename": doc_name,
                "score": round(sim, 4)
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def search_keyword(
        self,
        db: Session,
        merchant_id: str,
        query_text: str,
        dispute_id: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Keyword search using PostgreSQL full-text search or token matching for identifiers.
        Enforces strict merchant_id tenant isolation.
        """
        is_postgres = "postgresql" in settings.DATABASE_URL
        results = []

        if is_postgres:
            try:
                query_sql = """
                    SELECT 
                        c.id, c.document_id, c.dispute_id, c.chunk_text, c.page_number, 
                        c.document_category, c.metadata, d.filename,
                        ts_rank(to_tsvector('english', c.chunk_text), websearch_to_tsquery('english', :q)) as rank
                    FROM document_chunks c
                    JOIN documents d ON c.document_id = d.id
                    WHERE c.merchant_id = :merchant_id
                      AND to_tsvector('english', c.chunk_text) @@ websearch_to_tsquery('english', :q)
                """
                params = {"merchant_id": merchant_id, "q": query_text, "top_k": top_k}
                if category and category != "ALL":
                    query_sql += " AND c.document_category = :category"
                    params["category"] = category

                query_sql += " ORDER BY rank DESC LIMIT :top_k"
                rows = db.execute(text(query_sql), params).fetchall()
                for r in rows:
                    results.append({
                        "id": r[0],
                        "document_id": r[1],
                        "dispute_id": r[2],
                        "content": r[3],
                        "page_number": r[4],
                        "document_category": r[5],
                        "filename": r[7] or "Document",
                        "score": round(float(r[8]), 4)
                    })
                if results:
                    return results
            except Exception:
                db.rollback()

        # Token matching fallback (exact matches for invoice IDs, tracking numbers, keywords)
        keywords = [k.lower() for k in query_text.replace(",", " ").split() if len(k) > 2]
        query = db.query(DocumentChunk).filter(DocumentChunk.merchant_id == merchant_id)
        if category and category != "ALL":
            query = query.filter(DocumentChunk.document_category == category)
        
        all_chunks = query.all()
        scored = []
        for chk in all_chunks:
            text_lower = chk.chunk_text.lower()
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches > 0:
                score = matches / max(len(keywords), 1)
                doc_name = chk.chunk_metadata.get("filename") if chk.chunk_metadata else "Document"
                scored.append({
                    "id": chk.id,
                    "document_id": chk.document_id,
                    "dispute_id": chk.dispute_id,
                    "content": chk.chunk_text,
                    "page_number": chk.page_number,
                    "document_category": chk.document_category,
                    "filename": doc_name,
                    "score": round(score, 4)
                })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def search_hybrid(
        self,
        db: Session,
        merchant_id: str,
        query_text: str,
        query_vector: List[float],
        dispute_id: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
        rrf_k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search combining semantic and keyword searches using Reciprocal Rank Fusion (RRF).
        RRF_score = sum(1 / (k + rank))
        Deduplicates chunks and returns ranked evidence with citations and relevance scores.
        """
        semantic_hits = self.search_semantic(
            db=db,
            merchant_id=merchant_id,
            query_vector=query_vector,
            dispute_id=dispute_id,
            category=category,
            top_k=top_k * 2
        )
        keyword_hits = self.search_keyword(
            db=db,
            merchant_id=merchant_id,
            query_text=query_text,
            dispute_id=dispute_id,
            category=category,
            top_k=top_k * 2
        )

        rrf_scores: Dict[str, float] = {}
        chunks_map: Dict[str, Dict[str, Any]] = {}

        for rank, hit in enumerate(semantic_hits):
            cid = hit["id"]
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank + 1))
            chunks_map[cid] = hit

        for rank, hit in enumerate(keyword_hits):
            cid = hit["id"]
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank + 1))
            if cid not in chunks_map:
                chunks_map[cid] = hit

        # Rank by combined RRF score
        ranked_chunk_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        
        final_results = []
        for cid in ranked_chunk_ids[:top_k]:
            item = chunks_map[cid]
            item["rrf_score"] = round(rrf_scores[cid], 5)
            final_results.append(item)

        return final_results

    def delete_document_chunks(self, db: Session, merchant_id: str, document_id: str) -> int:
        deleted = db.query(DocumentChunk).filter(
            DocumentChunk.merchant_id == merchant_id,
            DocumentChunk.document_id == document_id
        ).delete()
        db.commit()
        return deleted

pgvector_client = PgVectorClient()
