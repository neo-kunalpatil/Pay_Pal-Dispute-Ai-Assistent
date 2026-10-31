from typing import Optional
from pydantic import BaseModel, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    role: str
    merchant_id: str
    business_name: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "merchant"

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    business_name: str
    role: Optional[str] = "merchant"
    country: Optional[str] = "US"
    currency: Optional[str] = "USD"

class AcceptInvitationRequest(BaseModel):
    token: str
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    merchant_id: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
