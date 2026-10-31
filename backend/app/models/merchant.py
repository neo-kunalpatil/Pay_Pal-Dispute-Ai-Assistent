import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    country = Column(String(10), default="US")
    currency = Column(String(10), default="USD")
    business_type = Column(String(100), default="Ecommerce")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="merchant", cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="merchant", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="merchant", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="merchant", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="merchant", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="merchant", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="merchant", cascade="all, delete-orphan")
    paypal_connection = relationship("PayPalConnection", back_populates="merchant", uselist=False, cascade="all, delete-orphan")
