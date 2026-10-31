import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(50), primary_key=True, default=lambda: f"evd-{uuid.uuid4().hex[:8]}")
    dispute_id = Column(String(50), ForeignKey("disputes.id"), nullable=False, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), nullable=False, index=True)
    evidence_type = Column(String(100), nullable=False)  # 'INVOICE', 'PROOF_OF_SHIPMENT', 'PROOF_OF_DELIVERY', etc.
    description = Column(Text, nullable=False)
    relevance_score = Column(Float, default=1.0)
    verification_status = Column(String(50), default="VERIFIED")  # 'VERIFIED', 'CONTRADICTORY', 'INCOMPLETE'
    source_page = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="evidence_items")
