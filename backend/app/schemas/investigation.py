from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class ContradictionSchema(BaseModel):
    id: str
    severity: str  # 'high', 'medium', 'low'
    title: str
    description: str
    sourceDocA: str
    sourceDocB: str
    recommendation: str

class SupportingEvidenceItem(BaseModel):
    documentName: str
    relevance: str
    pageRef: Optional[str] = None

class MissingEvidenceItem(BaseModel):
    item: str
    importance: str  # 'Mandatory', 'Recommended', 'Optional'
    reason: str

class PolicyClauseItem(BaseModel):
    clause: str
    source: str
    applicability: str

class AIInvestigationReportSchema(BaseModel):
    summary: str
    evidenceMatchScore: float = Field(alias="evidence_match_score")
    supportingEvidence: List[SupportingEvidenceItem] = Field(default_factory=list, alias="supporting_evidence")
    missingEvidence: List[MissingEvidenceItem] = Field(default_factory=list, alias="missing_evidence")
    contradictions: List[ContradictionSchema] = Field(default_factory=list)
    policyClauses: List[PolicyClauseItem] = Field(default_factory=list, alias="policy_clauses")
    recommendedAction: Optional[str] = Field(default=None, alias="recommendations")
    lastRunTimestamp: str = "Just now"

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class AgentStageTrace(BaseModel):
    id: int
    name: str
    shortDesc: str
    status: str
    agentRole: str
    details: List[str]
