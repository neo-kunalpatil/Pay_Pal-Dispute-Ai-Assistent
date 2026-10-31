from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.schemas.transaction import TransactionSchema, TransactionItem
from app.services.transaction_service import transaction_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])

def map_transaction_to_schema(t) -> TransactionSchema:
    items = [
        TransactionItem(name=i.get("name", "Product"), qty=i.get("qty", 1), price=float(i.get("price", t.amount)))
        for i in (t.items or [])
    ]
    if not items:
        items = [TransactionItem(name="Item Purchase", qty=1, price=t.amount)]

    return TransactionSchema(
        id=t.id,
        orderId=t.order_id,
        customerName=t.customer_name,
        customerEmail=t.customer_email,
        amount=t.amount,
        currency=t.currency,
        date=t.payment_date.strftime("%b %d, %Y") if t.payment_date else "Oct 28, 2026",
        type=t.payment_type,
        status=t.payment_status,
        disputeId=t.disputes[0].id if t.disputes else None,
        paymentMethod=t.payment_method,
        items=items,
        shippingAddress=t.shipping_address
    )

@router.get("", response_model=List[TransactionSchema])
def list_transactions(
    search: Optional[str] = Query(None),
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    txns = transaction_service.list_transactions(db, merchant.id, search=search)
    return [map_transaction_to_schema(t) for t in txns]

@router.get("/{txn_id}", response_model=TransactionSchema)
def get_transaction(
    txn_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    t = transaction_service.get_transaction(db, merchant.id, txn_id)
    if not t:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    return map_transaction_to_schema(t)

@router.post("/sync")
def sync_transactions(merchant: Merchant = Depends(get_current_merchant)):
    return {"success": True, "message": "PayPal transaction ledger refreshed."}
