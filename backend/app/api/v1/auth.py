from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, Token, UserResponse, AcceptInvitationRequest
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, req)

@router.post("/register", response_model=Token)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, req)

@router.post("/accept-invitation", response_model=Token)
def accept_invitation(req: AcceptInvitationRequest, db: Session = Depends(get_db)):
    return auth_service.accept_invitation(db, req)

@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        merchant_id=user.merchant_id or "",
        is_active=user.is_active
    )
