import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, default=lambda: f"TXN-{uuid.uuid4().hex[:6].upper()}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    order_id = Column(String(50), nullable=False, index=True)
    paypal_order_id = Column(String(100), nullable=True, index=True)
    paypal_capture_id = Column(String(100), nullable=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    payment_status = Column(String(50), default="Completed")  # 'Completed', 'Refunded', 'Disputed', 'Pending'
    payment_method = Column(String(100), default="PayPal Balance")
    payment_type = Column(String(50), default="Payment Received")
    shipping_address = Column(String(500), nullable=True)
    items = Column(JSON, default=list)  # list of {name, qty, price}
    payment_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    merchant = relationship("Merchant", back_populates="transactions")
    disputes = relationship("Dispute", back_populates="transaction")
