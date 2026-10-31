from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.schemas.investigation import AIInvestigationReportSchema
from app.services.investigation_service import investigation_service

router = APIRouter(tags=["AI Investigation"])

@router.post("/disputes/{dispute_id}/investigate", response_model=AIInvestigationReportSchema)
async def run_investigation(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    inv = await investigation_service.run_investigation(db, merchant.id, dispute_id)
    return AIInvestigationReportSchema(
        summary=inv.ai_summary,
        evidenceMatchScore=inv.evidence_match_score,
        supportingEvidence=inv.supporting_evidence or [],
        missingEvidence=inv.missing_evidence or [],
        contradictions=inv.contradictions or [],
        policyClauses=inv.policy_clauses or [],
        recommendedAction=inv.recommendations or "",
        lastRunTimestamp="Just now"
    )

@router.get("/disputes/{dispute_id}/investigation", response_model=AIInvestigationReportSchema)
def get_dispute_investigation(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    inv = investigation_service.get_latest_investigation(db, merchant.id, dispute_id)
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI investigation has been run yet for dispute {dispute_id}."
        )
    return AIInvestigationReportSchema(
        summary=inv.ai_summary,
        evidenceMatchScore=inv.evidence_match_score,
        supportingEvidence=inv.supporting_evidence or [],
        missingEvidence=inv.missing_evidence or [],
        contradictions=inv.contradictions or [],
        policyClauses=inv.policy_clauses or [],
        recommendedAction=inv.recommendations or "",
        lastRunTimestamp="Just now"
    )
