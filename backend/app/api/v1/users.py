import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.merchant import Merchant
from app.models.invitation import Invitation

router = APIRouter(prefix="/users", tags=["Users"])

class UserOut(BaseModel):
    id: str
    email: str
    fullName: str
    role: str
    isActive: bool
    merchantId: Optional[str] = None
    merchantName: Optional[str] = None
    createdAt: str

    model_config = ConfigDict(from_attributes=True)

class InviteUserRequest(BaseModel):
    email: str
    role: str = "analyst"  # 'analyst', 'merchant', 'admin'
    merchantId: Optional[str] = None

class InviteUserResponse(BaseModel):
    id: str
    email: str
    role: str
    invitationLink: str
    expiresAt: str

@router.get("", response_model=List[UserOut])
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        users = db.query(User).all()
    else:
        users = db.query(User).filter(User.merchant_id == current_user.merchant_id).all()

    results = []
    for u in users:
        m = db.query(Merchant).filter(Merchant.id == u.merchant_id).first() if u.merchant_id else None
        results.append(UserOut(
            id=u.id,
            email=u.email,
            fullName=u.full_name,
            role=u.role,
            isActive=u.is_active,
            merchantId=u.merchant_id,
            merchantName=m.business_name if m else None,
            createdAt=u.created_at.strftime("%b %d, %Y") if u.created_at else "Recently"
        ))
    return results

@router.post("/invite", response_model=InviteUserResponse)
def invite_user(
    req: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ("admin", "merchant"):
        raise HTTPException(status_code=403, detail="Only admins and merchant owners can invite users")

    # Target merchant
    target_merchant_id = current_user.merchant_id
    if current_user.role == "admin" and req.merchantId:
        target_merchant_id = req.merchantId

    token = f"inv-{uuid.uuid4().hex}"
    expires = datetime.now(timezone.utc) + timedelta(days=7)

    inv = Invitation(
        email=req.email,
        role=req.role,
        merchant_id=target_merchant_id,
        token=token,
        invited_by_id=current_user.id,
        expires_at=expires
    )
    db.add(inv)
    db.commit()

    return InviteUserResponse(
        id=inv.id,
        email=inv.email,
        role=inv.role,
        invitationLink=f"/register?invite={token}",
        expiresAt=expires.strftime("%Y-%m-%d %H:%M:%S UTC")
    )

@router.patch("/{user_id}/status")
def toggle_user_status(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only platform admins can change user status")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "email": user.email, "isActive": user.is_active}

