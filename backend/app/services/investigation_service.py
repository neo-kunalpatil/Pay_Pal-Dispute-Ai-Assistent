from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.dispute import Dispute, DisputeTimeline
from app.models.investigation import Investigation, InvestigationSource
from app.models.document import Document
from app.graph.state import InvestigationState
from app.graph.workflow import investigation_workflow
from app.core.exceptions import EntityNotFoundException

class InvestigationService:
    async def run_investigation(self, db: Session, merchant_id: str, dispute_id: str) -> Investigation:
        dispute = db.query(Dispute).filter(Dispute.id == dispute_id, Dispute.merchant_id == merchant_id).first()
        if not dispute:
            raise EntityNotFoundException("Dispute", dispute_id)

        dispute.ai_status = "Processing"
        db.commit()

        # Build Graph State
        state = InvestigationState(
            merchant_id=merchant_id,
            dispute_id=dispute.id,
            dispute_details={
                "id": dispute.id,
                "order_id": dispute.order_id,
                "customer_name": dispute.customer_name,
                "customer_email": dispute.customer_email,
                "product_name": dispute.product_name,
                "amount": dispute.amount,
                "reason": dispute.reason,
                "complaint_description": dispute.complaint_description,
                "customer_statement": dispute.customer_statement
            },
            buyer_complaint=dispute.customer_statement or dispute.complaint_description or ""
        )

        # Run 5-agent LangGraph workflow
        final_state = await investigation_workflow.execute(state)

        # Create or update Investigation record
        inv = Investigation(
            merchant_id=merchant_id,
            dispute_id=dispute.id,
            status=final_state.workflow_status,
            ai_summary=final_state.investigation_summary,
            evidence_match_score=final_state.evidence_match_score,
            confidence=0.92,
            supporting_evidence=final_state.verified_evidence,
            missing_evidence=final_state.missing_evidence,
            contradictions=final_state.contradictions,
            policy_clauses=final_state.policy_clauses,
            recommendations=final_state.recommendations,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(inv)
        db.flush()

        # Record sources
        for doc in final_state.retrieved_documents:
            src = InvestigationSource(
                investigation_id=inv.id,
                document_id=doc.get("document_id"),
                document_name=doc.get("filename"),
                page_number=str(doc.get("page_number", 1)),
                chunk_id=doc.get("chunk_id"),
                extracted_passage=doc.get("content", "")[:300],
                relevance_score=float(doc.get("score", 1.0))
            )
            db.add(src)

        # Update dispute
        dispute.ai_status = "Needs Attention" if final_state.contradictions else "Completed"
        if final_state.response_draft:
            dispute.response_draft = final_state.response_draft

        tl = DisputeTimeline(
            dispute_id=dispute.id,
            title="AI Multi-Agent Investigation Refreshed",
            description=f"5-node pipeline completed with match score {final_state.evidence_match_score}%. Verified {len(final_state.verified_evidence)} records.",
            actor="DisputePilot AI Agent",
            event_type="investigation_completed",
            timestamp="Just now"
        )
        db.add(tl)

        db.commit()
        db.refresh(inv)
        return inv

    def get_latest_investigation(self, db: Session, merchant_id: str, dispute_id: str) -> Optional[Investigation]:
        return db.query(Investigation).filter(
            Investigation.dispute_id == dispute_id,
            Investigation.merchant_id == merchant_id
        ).order_by(Investigation.started_at.desc()).first()

investigation_service = InvestigationService()
