from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class TransactionItem(BaseModel):
    name: str
    qty: int
    price: float

class TransactionSchema(BaseModel):
    id: str
    orderId: str = Field(default="", validation_alias="order_id")
    customerName: str = Field(default="", validation_alias="customer_name")
    customerEmail: str = Field(default="", validation_alias="customer_email")
    amount: float = 0.0
    currency: str = "USD"
    date: str = ""
    type: str = Field(default="Payment Received", validation_alias="payment_type")
    status: str = Field(default="Completed", validation_alias="payment_status")
    disputeId: Optional[str] = None
    paymentMethod: str = Field(default="PayPal Balance", validation_alias="payment_method")
    items: List[TransactionItem] = Field(default_factory=list)
    shippingAddress: Optional[str] = Field(default=None, validation_alias="shipping_address")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class BuyerOrderSchema(BaseModel):
    id: str
    productName: str
    orderNumber: str
    price: float
    date: str
    status: str
    image: str
    hasDispute: bool = False
    disputeId: Optional[str] = None
    trackingNumber: Optional[str] = None
