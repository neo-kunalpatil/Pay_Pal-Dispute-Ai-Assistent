import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(50), primary_key=True, default=lambda: f"inv-{uuid.uuid4().hex[:8]}")
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    dispute_id = Column(String(50), ForeignKey("disputes.id"), nullable=False, index=True)
    
    status = Column(String(50), default="Completed")  # 'Processing', 'Completed', 'Failed'
    ai_summary = Column(Text, nullable=False)
    evidence_match_score = Column(Float, default=85.0)  # 0 to 100
    confidence = Column(Float, default=0.9)
    
    supporting_evidence = Column(JSON, default=list)  # list of {documentName, relevance, pageRef}
    missing_evidence = Column(JSON, default=list)     # list of {item, importance, reason}
    contradictions = Column(JSON, default=list)       # list of {id, severity, title, description, sourceDocA, sourceDocB, recommendation}
    policy_clauses = Column(JSON, default=list)       # list of {clause, source, applicability}
    recommendations = Column(Text, nullable=True)
    
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    merchant = relationship("Merchant", back_populates="investigations")
    dispute = relationship("Dispute", back_populates="investigations")
    sources = relationship("InvestigationSource", back_populates="investigation", cascade="all, delete-orphan")

class InvestigationSource(Base):
    __tablename__ = "investigation_sources"

    id = Column(String(50), primary_key=True, default=lambda: f"src-{uuid.uuid4().hex[:8]}")
    investigation_id = Column(String(50), ForeignKey("investigations.id"), nullable=False, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), nullable=True)
    document_name = Column(String(255), nullable=True)
    page_number = Column(String(50), nullable=True)
    chunk_id = Column(String(100), nullable=True)
    extracted_passage = Column(Text, nullable=False)
    relevance_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="sources")
