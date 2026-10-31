import os
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import Document, DisputeDocument
from app.models.dispute import Dispute, DisputeTimeline
from app.storage.local_storage import storage
from app.rag.extraction import extractor
from app.rag.chunking import chunker
from app.rag.embeddings import embedding_service
from app.rag.pgvector_client import pgvector_client
from app.core.exceptions import EntityNotFoundException

class DocumentService:
    async def upload_document(
        self,
        db: Session,
        merchant_id: str,
        file_bytes: bytes,
        filename: str,
        category: str,
        linked_dispute_id: Optional[str] = None
    ) -> Document:
        extension = filename.split(".")[-1].lower() if "." in filename else "pdf"
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        saved_filename = f"{doc_id}_{filename}"
        
        # Save original file to configured storage
        storage_path = await storage.save_file(file_bytes, saved_filename)
        
        # Human-readable size string
        size_kb = len(file_bytes) / 1024
        size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb / 1024:.1f} MB"

        # Extract text & metadata
        extracted_text, metadata, pages = extractor.extract_text_and_metadata(file_bytes, filename, extension)
        
        summary = f"Processed {filename} ({category}). Extracted {len(pages)} sections. Chunks indexed in Neon PostgreSQL with pgvector embeddings."

        # Create database record
        doc = Document(
            id=doc_id,
            merchant_id=merchant_id,
            filename=filename,
            original_filename=filename,
            file_type=extension,
            file_size=size_str,
            file_size_bytes=len(file_bytes),
            document_category=category,
            storage_path=storage_path,
            processing_status="Indexed",
            extracted_text=extracted_text,
            summary=summary,
            extracted_metadata=metadata
        )
        db.add(doc)
        db.flush()

        # Split into chunks and generate 384-dimensional pgvector embeddings
        chunks = chunker.chunk_document(
            pages=pages,
            document_id=doc.id,
            merchant_id=merchant_id,
            filename=filename,
            document_category=category
        )
        for idx, chk in enumerate(chunks, start=1):
            chk["chunk_index"] = idx
            chk["embedding"] = embedding_service.generate_embedding(chk["content"])
            if linked_dispute_id:
                chk["dispute_id"] = linked_dispute_id

        # Persist chunks and vectors to Neon PostgreSQL
        pgvector_client.store_chunks(db, chunks)

        # Link to dispute if specified
        if linked_dispute_id:
            link = DisputeDocument(dispute_id=linked_dispute_id, document_id=doc.id)
            db.add(link)

            # Add to dispute timeline
            tl = DisputeTimeline(
                dispute_id=linked_dispute_id,
                title=f"Document Uploaded: {filename}",
                description=f"Attached to dispute evidence package under category '{category}'.",
                actor="Merchant",
                event_type="evidence_uploaded",
                timestamp="Just now"
            )
            db.add(tl)

        db.commit()
        db.refresh(doc)
        return doc

    def list_documents(
        self,
        db: Session,
        merchant_id: str,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Document]:
        query = db.query(Document).filter(Document.merchant_id == merchant_id)
        if category and category != "ALL":
            query = query.filter(Document.document_category == category)
        if search:
            query = query.filter(
                (Document.filename.ilike(f"%{search}%")) |
                (Document.document_category.ilike(f"%{search}%"))
            )
        return query.order_by(Document.uploaded_at.desc()).all()

    def get_document(self, db: Session, merchant_id: str, doc_id: str) -> Document:
        doc = db.query(Document).filter(Document.id == doc_id, Document.merchant_id == merchant_id).first()
        if not doc:
            raise EntityNotFoundException("Document", doc_id)
        return doc

    async def delete_document(self, db: Session, merchant_id: str, doc_id: str) -> bool:
        doc = self.get_document(db, merchant_id, doc_id)
        await storage.delete_file(doc.storage_path)
        pgvector_client.delete_document_chunks(db, merchant_id, doc_id)
        db.delete(doc)
        db.commit()
        return True

    def link_document(self, db: Session, merchant_id: str, doc_id: str, dispute_id: str):
        doc = self.get_document(db, merchant_id, doc_id)
        existing = db.query(DisputeDocument).filter(
            DisputeDocument.dispute_id == dispute_id,
            DisputeDocument.document_id == doc_id
        ).first()
        if not existing:
            link = DisputeDocument(dispute_id=dispute_id, document_id=doc_id)
            db.add(link)
            db.commit()
        return True

document_service = DocumentService()
