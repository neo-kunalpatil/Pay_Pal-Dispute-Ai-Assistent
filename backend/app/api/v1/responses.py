from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant, get_current_user
from app.models.merchant import Merchant
from app.models.user import User
from app.schemas.response import (
    ResponseDraftUpdateRequest,
    ResponseApprovalRequest,
    ResponseSubmissionResult
)
from app.services.dispute_service import dispute_service

router = APIRouter(tags=["Response Center"])

@router.post("/disputes/{dispute_id}/draft")
def update_draft(
    dispute_id: str,
    req: ResponseDraftUpdateRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disp = dispute_service.update_draft(
        db=db,
        merchant_id=merchant.id,
        dispute_id=dispute_id,
        draft=req.draft,
        notes=req.merchant_notes
    )
    return {"success": True, "disputeId": disp.id, "draft": disp.response_draft}

@router.post("/disputes/{dispute_id}/approve")
def approve_response(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    disp = dispute_service.approve_response(
        db=db,
        merchant_id=merchant.id,
        dispute_id=dispute_id,
        user_id=user.id
    )
    return {"success": True, "disputeId": disp.id, "status": disp.status, "isApproved": True}

@router.post("/disputes/{dispute_id}/submit-evidence", response_model=ResponseSubmissionResult)
async def submit_dispute_evidence(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = await dispute_service.submit_evidence_to_paypal(
        db=db,
        merchant_id=merchant.id,
        dispute_id=dispute_id,
        user_id=user.id
    )
    return ResponseSubmissionResult(
        success=True,
        submissionRef=res["submissionRef"],
        message="Rebuttal package successfully transmitted to PayPal.",
        dispute_id=dispute_id
    )
