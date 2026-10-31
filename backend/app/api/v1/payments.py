from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.schemas.paypal import (
    CreateOrderRequest,
    CreateOrderResponse,
    CaptureOrderRequest,
    CaptureOrderResponse
)
from app.services.paypal_service import paypal_service

router = APIRouter(prefix="/payments/paypal", tags=["PayPal Payments"])

@router.post("/create-order", response_model=CreateOrderResponse)
async def create_paypal_order(
    req: CreateOrderRequest,
    merchant: Merchant = Depends(get_current_merchant)
):
    res = await paypal_service.create_checkout_order(
        product_name=req.productName,
        amount=req.amount,
        currency=req.currency or "USD",
        order_number=req.orderNumber
    )
    return CreateOrderResponse(
        orderId=res["orderId"],
        status=res["status"],
        approveUrl=res.get("approveUrl")
    )

@router.post("/capture-order", response_model=CaptureOrderResponse)
async def capture_paypal_order(
    req: CaptureOrderRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    res = await paypal_service.capture_checkout_order(
        db=db,
        merchant_id=merchant.id,
        order_id=req.orderId
    )
    return CaptureOrderResponse(
        orderId=res["orderId"],
        captureId=res["captureId"],
        status=res["status"],
        amount=res["amount"],
        currency=res["currency"],
        transactionId=res["transactionId"]
    )
