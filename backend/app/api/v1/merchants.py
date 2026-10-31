from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.merchant import Merchant
from app.models.user import User
from app.models.dispute import Dispute
from app.models.transaction import Transaction

router = APIRouter(prefix="/merchants", tags=["Merchants"])

class MerchantOut(BaseModel):
    id: str
    businessName: str
    email: str
    country: str
    currency: str
    businessType: Optional[str] = "Ecommerce"
    createdAt: str
    totalDisputes: int = 0
    totalTransactions: int = 0

    model_config = ConfigDict(from_attributes=True)

class CreateMerchantRequest(BaseModel):
    businessName: str
    email: str
    country: str = "US"
    currency: str = "USD"
    businessType: str = "Ecommerce"

@router.get("", response_model=List[MerchantOut])
def list_merchants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        merchants = db.query(Merchant).all()
    else:
        merchants = db.query(Merchant).filter(Merchant.id == current_user.merchant_id).all()

    results = []
    for m in merchants:
        d_count = db.query(Dispute).filter(Dispute.merchant_id == m.id).count()
        t_count = db.query(Transaction).filter(Transaction.merchant_id == m.id).count()
        results.append(MerchantOut(
            id=m.id,
            businessName=m.business_name,
            email=m.email,
            country=m.country,
            currency=m.currency,
            businessType=m.business_type,
            createdAt=m.created_at.strftime("%b %d, %Y") if m.created_at else "Recently",
            totalDisputes=d_count,
            totalTransactions=t_count
        ))
    return results

@router.post("", response_model=MerchantOut)
def create_merchant(
    req: CreateMerchantRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only platform admins can create merchants")

    existing = db.query(Merchant).filter(Merchant.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Merchant with this email already exists")

    m = Merchant(
        business_name=req.businessName,
        email=req.email,
        country=req.country,
        currency=req.currency,
        business_type=req.businessType
    )
    db.add(m)
    db.commit()
    db.refresh(m)

    return MerchantOut(
        id=m.id,
        businessName=m.business_name,
        email=m.email,
        country=m.country,
        currency=m.currency,
        businessType=m.business_type,
        createdAt=m.created_at.strftime("%b %d, %Y") if m.created_at else "Recently",
        totalDisputes=0,
        totalTransactions=0
    )

