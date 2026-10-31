import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.transaction import Transaction

class TransactionService:
    def list_transactions(self, db: Session, merchant_id: str, search: Optional[str] = None) -> List[Transaction]:
        query = db.query(Transaction).filter(Transaction.merchant_id == merchant_id)
        if search:
            query = query.filter(
                (Transaction.id.ilike(f"%{search}%")) |
                (Transaction.order_id.ilike(f"%{search}%")) |
                (Transaction.customer_name.ilike(f"%{search}%"))
            )
        return query.order_by(Transaction.created_at.desc()).all()

    def get_transaction(self, db: Session, merchant_id: str, txn_id: str) -> Optional[Transaction]:
        return db.query(Transaction).filter(Transaction.id == txn_id, Transaction.merchant_id == merchant_id).first()

    def record_paypal_capture(
        self,
        db: Session,
        merchant_id: str,
        order_id: str,
        paypal_order_id: str,
        paypal_capture_id: str,
        customer_name: str,
        customer_email: str,
        amount: float,
        currency: str,
        product_name: str
    ) -> Transaction:
        txn = Transaction(
            id=f"TXN-{uuid.uuid4().hex[:5].upper()}",
            merchant_id=merchant_id,
            order_id=order_id,
            paypal_order_id=paypal_order_id,
            paypal_capture_id=paypal_capture_id,
            customer_name=customer_name,
            customer_email=customer_email,
            amount=amount,
            currency=currency,
            payment_status="Completed",
            payment_method="PayPal Checkout (Sandbox)",
            payment_type="Payment Received",
            items=[{"name": product_name, "qty": 1, "price": amount}]
        )
        db.add(txn)
        db.commit()
        db.refresh(txn)
        return txn

transaction_service = TransactionService()
