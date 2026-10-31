import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True, default=lambda: f"notif-{uuid.uuid4().hex[:8]}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    time = Column(String(100), default="Just now")
    read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="INFO")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    merchant = relationship("Merchant", back_populates="notifications")
