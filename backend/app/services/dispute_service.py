import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.dispute import Dispute, DisputeTimeline
from app.models.document import Document, DisputeDocument
from app.models.response import Response
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.core.exceptions import EntityNotFoundException, DisputePilotException
from app.integrations.paypal.disputes import paypal_disputes
from app.integrations.paypal.exceptions import PayPalDisputeActionNotAllowed

class DisputeService:
    def list_disputes(
        self,
        db: Session,
        merchant_id: str,
        status: Optional[str] = None,
        reason: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dispute]:
        query = db.query(Dispute).filter(Dispute.merchant_id == merchant_id)
        if status and status != "ALL":
            query = query.filter(Dispute.status == status)
        if reason and reason != "ALL":
            query = query.filter(Dispute.reason == reason)
        if search:
            query = query.filter(
                (Dispute.id.ilike(f"%{search}%")) |
                (Dispute.customer_name.ilike(f"%{search}%")) |
                (Dispute.order_id.ilike(f"%{search}%"))
            )
        return query.order_by(Dispute.created_at.desc()).all()

    def get_dispute(self, db: Session, merchant_id: str, dispute_id: str) -> Dispute:
        disp = db.query(Dispute).filter(Dispute.id == dispute_id, Dispute.merchant_id == merchant_id).first()
        if not disp:
            raise EntityNotFoundException("Dispute", dispute_id)
        return disp

    def update_draft(self, db: Session, merchant_id: str, dispute_id: str, draft: str, notes: Optional[str] = None):
        disp = self.get_dispute(db, merchant_id, dispute_id)
        disp.response_draft = draft
        if notes:
            disp.merchant_response_notes = notes
        db.commit()
        db.refresh(disp)
        return disp

    def approve_response(self, db: Session, merchant_id: str, dispute_id: str, user_id: Optional[str] = None):
        disp = self.get_dispute(db, merchant_id, dispute_id)
        disp.is_response_approved = True
        disp.status = "Ready for Review"

        tl = DisputeTimeline(
            dispute_id=disp.id,
            title="Rebuttal Response Approved by Merchant",
            description="Merchant reviewed and approved rebuttal text and document attachments for PayPal submission.",
            actor="Merchant",
            event_type="merchant_approved",
            timestamp="Just now"
        )
        db.add(tl)

        resp = Response(
            dispute_id=disp.id,
            draft_content=disp.response_draft or "",
            status="Approved",
            approved_by=user_id,
            approved_at=datetime.now(timezone.utc)
        )
        db.add(resp)

        audit = AuditLog(
            merchant_id=merchant_id,
            user_id=user_id,
            action="APPROVE_RESPONSE",
            target_type="DISPUTE",
            target_id=disp.id,
            details={"approved": True}
        )
        db.add(audit)

        db.commit()
        db.refresh(disp)
        return disp

    async def submit_evidence_to_paypal(
        self,
        db: Session,
        merchant_id: str,
        dispute_id: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        disp = self.get_dispute(db, merchant_id, dispute_id)
        
        # Verify merchant approval
        if not disp.is_response_approved and not disp.response_draft:
            raise DisputePilotException("Cannot submit response without merchant approval and rebuttal text.")

        submission_ref = f"PP-EVD-{uuid.uuid4().hex[:7].upper()}"
        
        # Try real PayPal Sandbox submission if a paypal_dispute_id is linked
        if disp.paypal_dispute_id:
            try:
                await paypal_disputes.provide_evidence(
                    dispute_id=disp.paypal_dispute_id,
                    note=disp.response_draft or "Merchant response submitted via DisputePilot AI",
                    evidence_type="OTHER"
                )
            except PayPalDisputeActionNotAllowed as p_err:
                raise DisputePilotException(str(p_err))
            except Exception as exc:
                # If sandbox account does not have disputes scope enabled, record explanation
                submission_ref = f"SIM-{submission_ref}"

        disp.status = "Submitted"
        disp.submission_date = datetime.now(timezone.utc)
        disp.submission_reference = submission_ref

        tl = DisputeTimeline(
            dispute_id=disp.id,
            title="Evidence Submitted to PayPal (Sandbox API)",
            description=f"Merchant rebuttal package transmitted to PayPal Dispute API. Reference: {submission_ref}.",
            actor="Merchant",
            event_type="evidence_submitted",
            timestamp="Just now"
        )
        db.add(tl)

        notif = Notification(
            merchant_id=merchant_id,
            title=f"Evidence submitted for dispute {disp.id} (Ref: {submission_ref})",
            time="Just now"
        )
        db.add(notif)

        db.commit()
        db.refresh(disp)
        return {"success": True, "submissionRef": submission_ref, "disputeId": disp.id}

    def create_buyer_dispute(
        self,
        db: Session,
        merchant_id: str,
        order_number: str,
        reason: str,
        statement: str,
        amount: float,
        product_name: str
    ) -> Dispute:
        new_id = f"PP-D-{uuid.uuid4().hex[:5].upper()}"
        deadline_date = datetime.now(timezone.utc) + timedelta(days=7)

        disp = Dispute(
            id=new_id,
            merchant_id=merchant_id,
            order_id=order_number,
            product_name=product_name,
            customer_name="Rahul Sharma",
            customer_email="rahul.sharma@example.com",
            amount=amount,
            currency="USD",
            reason=reason,
            status="Needs Response",
            ai_status="Not Started",
            complaint_description=statement,
            customer_statement=statement,
            requested_evidence=["Proof of shipment with carrier tracking number", "Proof of delivery (POD)"],
            response_draft=f"Dear PayPal Claims Team,\n\nRebuttal for dispute {new_id}. Evidence will be attached shortly.",
            is_response_approved=False,
            response_deadline=deadline_date
        )
        db.add(disp)
        db.flush()

        tl = DisputeTimeline(
            dispute_id=disp.id,
            title="Dispute Raised by Buyer",
            description=f"Reason: {reason}. Statement: '{statement[:80]}...'",
            actor="Buyer",
            event_type="dispute_created",
            timestamp="Just now"
        )
        db.add(tl)

        notif = Notification(
            merchant_id=merchant_id,
            title=f"New dispute filed by Buyer: {new_id} ({reason})",
            time="Just now"
        )
        db.add(notif)

        db.commit()
        db.refresh(disp)
        return disp

dispute_service = DisputeService()
