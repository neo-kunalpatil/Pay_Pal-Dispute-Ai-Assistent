from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class InvestigationState(BaseModel):
    merchant_id: str
    dispute_id: str
    dispute_details: Dict[str, Any]
    transaction_details: Optional[Dict[str, Any]] = None
    buyer_complaint: str
    
    # Agent 1 outputs
    claim_type: str = ""
    target_amount: float = 0.0
    evidence_requirements: List[str] = Field(default_factory=list)
    key_dates: Dict[str, str] = Field(default_factory=dict)
    
    # Agent 2 outputs
    retrieved_documents: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Agent 3 outputs
    policy_clauses: List[Dict[str, str]] = Field(default_factory=list)
    
    # Agent 4 outputs
    verified_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    missing_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    contradictions: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_match_score: float = 85.0
    
    # Agent 5 outputs
    investigation_summary: str = ""
    recommendations: str = ""
    response_draft: str = ""
    workflow_status: str = "COMPLETED"
    errors: List[str] = Field(default_factory=list)
