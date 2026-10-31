import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(50), primary_key=True, default=lambda: f"doc-{uuid.uuid4().hex[:8]}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'pdf', 'docx', 'xlsx', 'csv', 'jpg', 'png'
    file_size = Column(String(50), nullable=False)  # human readable e.g. "1.2 MB"
    file_size_bytes = Column(Integer, default=0)
    document_category = Column(String(100), nullable=False)  # 'Invoices', 'Shipping Documents', 'Delivery Proof', etc.
    storage_path = Column(String(500), nullable=False)
    processing_status = Column(String(50), default="Processing")  # 'Uploaded', 'Processing', 'Indexed', 'Failed'
    
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    extracted_metadata = Column(JSON, default=dict)
    
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    merchant = relationship("Merchant", back_populates="documents")
    dispute_links = relationship("DisputeDocument", back_populates="document", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="document", cascade="all, delete-orphan")

class DisputeDocument(Base):
    __tablename__ = "dispute_documents"

    id = Column(String(50), primary_key=True, default=lambda: f"dd-{uuid.uuid4().hex[:8]}")
    dispute_id = Column(String(50), ForeignKey("disputes.id"), nullable=False, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dispute = relationship("Dispute", back_populates="dispute_documents")
    document = relationship("Document", back_populates="dispute_links")
