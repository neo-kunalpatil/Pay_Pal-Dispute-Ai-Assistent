import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Response(Base):
    __tablename__ = "responses"

    id = Column(String(50), primary_key=True, default=lambda: f"resp-{uuid.uuid4().hex[:8]}")
    dispute_id = Column(String(50), ForeignKey("disputes.id"), nullable=False, index=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id"), nullable=True, index=True)
    
    draft_content = Column(Text, nullable=False)
    status = Column(String(50), default="Draft")  # 'Draft', 'Approved', 'Submitted', 'Rejected'
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    paypal_reference = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dispute = relationship("Dispute", back_populates="responses")
