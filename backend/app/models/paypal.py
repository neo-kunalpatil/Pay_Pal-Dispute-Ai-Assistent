import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class PayPalConnection(Base):
    __tablename__ = "paypal_connections"

    id = Column(String(50), primary_key=True, default=lambda: f"ppc-{uuid.uuid4().hex[:8]}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, unique=True, index=True)
    environment = Column(String(20), default="sandbox")  # 'sandbox' or 'live'
    paypal_merchant_id = Column(String(100), nullable=True)
    connection_status = Column(String(50), default="Connected")  # 'Connected', 'Disconnected', 'Error'
    last_sync_time = Column(String(100), default="Today at 11:45 AM")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    merchant = relationship("Merchant", back_populates="paypal_connection")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String(50), primary_key=True, default=lambda: f"wh-{uuid.uuid4().hex[:8]}")
    provider = Column(String(50), default="paypal")
    event_id = Column(String(150), unique=True, nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    processing_status = Column(String(50), default="PROCESSED")  # 'RECEIVED', 'PROCESSED', 'FAILED', 'DUPLICATE'
    payload = Column(JSON, default=dict)
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
