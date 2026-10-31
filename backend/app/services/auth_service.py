from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.merchant import Merchant
from app.models.user import User
from app.models.invitation import Invitation
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException, DisputePilotException
from app.schemas.auth import LoginRequest, RegisterRequest, Token, AcceptInvitationRequest

class AuthService:
    def login(self, db: Session, req: LoginRequest) -> Token:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
        
        merchant = db.query(Merchant).filter(Merchant.id == user.merchant_id).first() if user.merchant_id else None
        token = create_access_token(user.id)
        
        return Token(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            role=user.role,
            merchant_id=user.merchant_id or "",
            business_name=merchant.business_name if merchant else "DisputePilot Platform"
        )

    def register(self, db: Session, req: RegisterRequest) -> Token:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise DisputePilotException("User with this email already exists")

        merchant_id = None
        business_name = req.business_name or f"{req.full_name}'s Account"

        if req.role == "merchant":
            merchant = Merchant(
                business_name=business_name,
                email=req.email,
                country=req.country or "US",
                currency=req.currency or "USD"
            )
            db.add(merchant)
            db.flush()
            merchant_id = merchant.id
        else:
            default_m = db.query(Merchant).first()
            merchant_id = default_m.id if default_m else None

        user = User(
            merchant_id=merchant_id,
            email=req.email,
            full_name=req.full_name,
            password_hash=get_password_hash(req.password),
            role=req.role or "merchant"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(user.id)
        return Token(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            role=user.role,
            merchant_id=merchant_id or "",
            business_name=business_name
        )

    def accept_invitation(self, db: Session, req: AcceptInvitationRequest) -> Token:
        inv = db.query(Invitation).filter(
            Invitation.token == req.token,
            Invitation.is_accepted == False
        ).first()
        if not inv:
            raise DisputePilotException("Invalid or already used invitation token")

        if inv.expires_at < datetime.now(timezone.utc):
            raise DisputePilotException("This invitation has expired")

        existing_user = db.query(User).filter(User.email == inv.email).first()
        if existing_user:
            raise DisputePilotException("User with this invitation email already exists")

        user = User(
            merchant_id=inv.merchant_id,
            email=inv.email,
            full_name=req.full_name,
            password_hash=get_password_hash(req.password),
            role=inv.role or "analyst",
            is_active=True
        )
        db.add(user)
        inv.is_accepted = True
        db.commit()
        db.refresh(user)

        merchant = db.query(Merchant).filter(Merchant.id == user.merchant_id).first() if user.merchant_id else None
        token = create_access_token(user.id)
        return Token(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            role=user.role,
            merchant_id=user.merchant_id or "",
            business_name=merchant.business_name if merchant else "DisputePilot Platform"
        )

auth_service = AuthService()
