import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String(50), primary_key=True, default=lambda: f"PP-D-{uuid.uuid4().hex[:5].upper()}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    transaction_id = Column(String(50), ForeignKey("transactions.id"), nullable=True, index=True)
    paypal_dispute_id = Column(String(100), nullable=True, index=True)
    order_id = Column(String(50), nullable=False)
    product_name = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_avatar = Column(String(500), nullable=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    reason = Column(String(100), nullable=False)  # 'Product Not Received', 'Product Not as Described', etc.
    status = Column(String(50), default="Needs Response")  # 'Needs Response', 'Under Review', 'Evidence Pending', 'Ready for Review', 'Submitted', 'Resolved', 'Closed'
    lifecycle_stage = Column(String(50), default="INQUIRY")  # PayPal lifecycle stage: INQUIRY, CHARGEBACK, PRE_ARBITRATION, ARBITRATION
    priority = Column(String(20), default="HIGH")
    ai_status = Column(String(50), default="Not Started")  # 'Not Started', 'Processing', 'Completed', 'Needs Attention'
    
    complaint_description = Column(Text, nullable=True)
    customer_statement = Column(Text, nullable=True)
    requested_evidence = Column(JSON, default=list)  # list of strings
    response_draft = Column(Text, nullable=True)
    merchant_response_notes = Column(Text, nullable=True)
    is_response_approved = Column(Boolean, default=False)
    submission_date = Column(DateTime, nullable=True)
    submission_reference = Column(String(100), nullable=True)
    
    dispute_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    response_deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    merchant = relationship("Merchant", back_populates="disputes")
    transaction = relationship("Transaction", back_populates="disputes")
    timeline_items = relationship("DisputeTimeline", back_populates="dispute", cascade="all, delete-orphan", order_by="DisputeTimeline.created_at.desc()")
    dispute_documents = relationship("DisputeDocument", back_populates="dispute", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="dispute", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="dispute", cascade="all, delete-orphan")

class DisputeTimeline(Base):
    __tablename__ = "dispute_timelines"

    id = Column(String(50), primary_key=True, default=lambda: f"tl-{uuid.uuid4().hex[:8]}")
    dispute_id = Column(String(50), ForeignKey("disputes.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    actor = Column(String(100), default="DisputePilot AI Agent")
    event_type = Column(String(50), nullable=False)  # 'dispute_created', 'evidence_uploaded', etc.
    timestamp = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dispute = relationship("Dispute", back_populates="timeline_items")
