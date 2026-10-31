from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.rag.pgvector_client import pgvector_client
from app.rag.embeddings import embedding_service
from app.database.session import SessionLocal

class EvidenceRetrieverService:
    """
    Centralized LangChain & LangGraph evidence retrieval service backed by Neon PostgreSQL + pgvector.
    Guarantees merchant tenant isolation and structured source citations.
    """

    def retrieve(
        self,
        merchant_id: str,
        query: str,
        dispute_id: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
        search_type: str = "hybrid",
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant evidence chunks using Neon pgvector.
        Enforces strict merchant_id isolation.
        """
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True

        try:
            query_vector = embedding_service.generate_embedding(query)

            if search_type == "semantic":
                return pgvector_client.search_semantic(
                    db=db,
                    merchant_id=merchant_id,
                    query_vector=query_vector,
                    dispute_id=dispute_id,
                    category=category,
                    top_k=top_k
                )
            elif search_type == "keyword":
                return pgvector_client.search_keyword(
                    db=db,
                    merchant_id=merchant_id,
                    query_text=query,
                    dispute_id=dispute_id,
                    category=category,
                    top_k=top_k
                )
            else:  # hybrid (default)
                return pgvector_client.search_hybrid(
                    db=db,
                    merchant_id=merchant_id,
                    query_text=query,
                    query_vector=query_vector,
                    dispute_id=dispute_id,
                    category=category,
                    top_k=top_k
                )
        finally:
            if should_close:
                db.close()

retriever_service = EvidenceRetrieverService()
