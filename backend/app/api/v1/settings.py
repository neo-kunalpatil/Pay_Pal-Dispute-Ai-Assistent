from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_settings(merchant: Merchant = Depends(get_current_merchant)):
    return {
        "businessName": merchant.business_name,
        "email": merchant.email,
        "country": merchant.country,
        "currency": merchant.currency,
        "businessType": merchant.business_type,
        "autoInvestigate": True,
        "aiConfidenceThreshold": 0.85,
        "notificationEmail": merchant.email,
        "sellerProtectionThreshold": 750.00
    }

@router.patch("")
def update_settings(
    settings_data: Dict[str, Any],
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    if "businessName" in settings_data:
        merchant.business_name = settings_data["businessName"]
    if "currency" in settings_data:
        merchant.currency = settings_data["currency"]
    db.commit()
    return {"success": True, "message": "Settings updated successfully."}
