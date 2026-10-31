import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, default=lambda: f"audit-{uuid.uuid4().hex[:8]}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # 'LOGIN', 'APPROVE_RESPONSE', 'SUBMIT_EVIDENCE', 'UPLOAD_DOC', etc.
    target_type = Column(String(50), nullable=True)  # 'DISPUTE', 'DOCUMENT', 'RESPONSE', 'PAYPAL'
    target_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    merchant = relationship("Merchant", back_populates="audit_logs")
