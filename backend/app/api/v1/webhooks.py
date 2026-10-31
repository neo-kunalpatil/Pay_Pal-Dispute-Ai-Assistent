import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Request, Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.paypal import WebhookEvent
from app.models.dispute import Dispute, DisputeTimeline
from app.models.transaction import Transaction
from app.integrations.paypal.webhooks import paypal_webhooks

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/paypal")
async def handle_paypal_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    headers = dict(request.headers)
    body_json = await request.json()

    event_id = body_json.get("id") or str(uuid.uuid4())
    event_type = body_json.get("event_type", "UNKNOWN")

    # Check for duplicate webhook processing
    existing = db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).first()
    if existing:
        return {"status": "duplicate", "eventId": event_id}

    # Verify signature
    is_valid = await paypal_webhooks.verify_signature(headers, body_json)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PayPal webhook signature"
        )

    # Record event
    event_record = WebhookEvent(
        event_id=event_id,
        event_type=event_type,
        processing_status="PROCESSED",
        payload=body_json
    )
    db.add(event_record)

    resource = body_json.get("resource", {})

    # Handle dispute events
    if "DISPUTE" in event_type:
        pp_dispute_id = resource.get("dispute_id")
        if pp_dispute_id:
            disp = db.query(Dispute).filter(Dispute.paypal_dispute_id == pp_dispute_id).first()
            if disp:
                if event_type == "CUSTOMER.DISPUTE.RESOLVED":
                    disp.status = "Resolved"
                elif event_type == "CUSTOMER.DISPUTE.UPDATED":
                    disp.status = "Under Review"

                tl = DisputeTimeline(
                    dispute_id=disp.id,
                    title=f"PayPal Webhook: {event_type}",
                    description=f"Status update received from PayPal Dispute API.",
                    actor="PayPal System",
                    event_type="dispute_created",
                    timestamp="Just now"
                )
                db.add(tl)

    # Handle payment capture events
    elif event_type == "PAYMENT.CAPTURE.COMPLETED":
        capture_id = resource.get("id")
        amount = float(resource.get("amount", {}).get("value", 0.0))
        # Update or record transaction
        txn = db.query(Transaction).filter(Transaction.paypal_capture_id == capture_id).first()
        if txn:
            txn.payment_status = "Completed"

    db.commit()
    return {"status": "received", "eventType": event_type, "eventId": event_id}
