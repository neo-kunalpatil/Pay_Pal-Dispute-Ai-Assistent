import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import relationship
from app.database.session import Base, engine

# Try to use pgvector's Vector type if supported, fallback to JSON for SQLite compatibility
try:
    from pgvector.sqlalchemy import Vector
    VectorType = Vector(384)
except Exception:
    VectorType = JSON

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(50), primary_key=True, default=lambda: f"chk-{uuid.uuid4().hex[:8]}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), nullable=False, index=True)
    dispute_id = Column(String(50), ForeignKey("disputes.id"), nullable=True, index=True)
    
    chunk_index = Column(Integer, nullable=False, default=1)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(VectorType, nullable=True)
    page_number = Column(Integer, default=1)
    document_category = Column(String(100), nullable=False)
    chunk_metadata = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    merchant = relationship("Merchant")
    document = relationship("Document", backref="chunks")
    dispute = relationship("Dispute", backref="chunks")

    __table_args__ = (
        Index("idx_document_chunks_tenant_doc", "merchant_id", "document_id"),
        Index("idx_document_chunks_tenant_dispute", "merchant_id", "dispute_id"),
        Index("idx_document_chunks_category", "merchant_id", "document_category"),
    )
