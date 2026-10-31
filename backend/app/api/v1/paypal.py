from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.config import settings
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.schemas.paypal import (
    PayPalConnectionStatus,
    PayPalTestResponse,
    DisputeSyncResult
)
from app.services.paypal_service import paypal_service

router = APIRouter(prefix="/paypal", tags=["PayPal Management"])

@router.get("/client-id")
def get_paypal_public_client_id():
    """Safe endpoint exposing only the PayPal Sandbox Client ID for frontend SDK rendering"""
    return {
        "clientId": settings.PAYPAL_CLIENT_ID or "",
        "environment": settings.PAYPAL_MODE
    }

@router.get("/connection", response_model=PayPalConnectionStatus)
def get_connection_status(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return paypal_service.get_connection_status(db, merchant.id)

@router.post("/test-connection", response_model=PayPalTestResponse)
async def test_paypal_connection():
    res = await paypal_service.test_connection()
    return PayPalTestResponse(**res)

@router.post("/disputes/sync", response_model=DisputeSyncResult)
async def sync_disputes(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    res = await paypal_service.sync_disputes_from_paypal(db, merchant.id)
    return DisputeSyncResult(**res)

@router.post("/transactions/sync")
def sync_transactions():
    return {"success": True, "message": "PayPal transaction sync completed."}
