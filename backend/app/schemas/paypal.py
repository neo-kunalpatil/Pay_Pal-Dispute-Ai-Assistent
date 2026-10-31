from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class PayPalConnectionStatus(BaseModel):
    connected: bool
    environment: str
    merchantEmail: str
    clientIdPreview: str
    lastSyncTime: str
    webhookActive: bool
    allowedActions: List[str]

class PayPalTestResponse(BaseModel):
    success: bool
    latencyMs: int
    environment: str
    message: str
    tokenValid: bool

class CreateOrderRequest(BaseModel):
    productName: str
    amount: float
    currency: Optional[str] = "USD"
    orderNumber: Optional[str] = None

class CreateOrderResponse(BaseModel):
    orderId: str
    status: str
    approveUrl: Optional[str] = None

class CaptureOrderRequest(BaseModel):
    orderId: str

class CaptureOrderResponse(BaseModel):
    orderId: str
    captureId: str
    status: str
    amount: float
    currency: str
    transactionId: str

class DisputeSyncResult(BaseModel):
    syncedCount: int
    updatedCount: int
    message: str
