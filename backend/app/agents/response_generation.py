from typing import Dict, Any
from app.graph.state import InvestigationState
from app.core.llm import llm_client

class ResponseGenerationAgent:
    """Agent 5: Synthesizes structured 4-part legal rebuttal letter and merchant investigation report"""

    def run(self, state: InvestigationState) -> Dict[str, Any]:
        dispute = state.dispute_details
        dispute_id = state.dispute_id
        order_id = dispute.get("order_id", "ORD-1001")
        customer_name = dispute.get("customer_name", "Valued Customer")
        amount = state.target_amount
        reason = state.claim_type
        
        evidence_list = state.verified_evidence
        missing = state.missing_evidence
        contradictions = state.contradictions

        # Try generating with live Gemini LLM if configured
        draft = None
        if llm_client.is_available():
            prompt = f"""
You are a PayPal Dispute Resolution Senior Specialist acting on behalf of the merchant.
Draft a formal, professional 4-part rebuttal letter to PayPal Dispute Resolution for dispute ID: {dispute_id}.

Transaction Details:
- Order ID: {order_id}
- Buyer: {customer_name} ({dispute.get('customer_email')})
- Disputed Amount: ${amount:.2f} USD
- Dispute Reason: {reason}
- Buyer Statement: "{dispute.get('customer_statement')}"

Verified Merchant Evidence:
{evidence_list}

Store Policies & Terms:
{state.policy_clauses}

Identified Contradictions:
{contradictions}

Missing Items:
{missing}

Requirements:
1. Format as:
   Dear PayPal Dispute Resolution Specialist,
   1. Order & Fulfillment Verification: ...
   2. Shipment & Tracking Telemetry: ...
   3. Evidence Attachments & Policy Compliance: ...
   4. Resolution Request / Addressed Contradictions: ...
   Sincerely,
   Merchant Operations
2. State facts objectively based ONLY on provided evidence. Do not invent tracking numbers or dates.
"""
            draft = llm_client.generate_text(
                prompt=prompt,
                system_instruction="You are an expert PayPal Dispute Specialist drafting official rebuttal evidence."
            )

        # Fallback to deterministic high-precision template if LLM is offline or in test mode
        if not draft:
            draft = f"""Dear PayPal Dispute Resolution Specialist,

We are submitting formal merchant rebuttal evidence for dispute {dispute_id} regarding Order {order_id} (${amount:.2f} USD).

1. Order & Fulfillment Verification:
The buyer {customer_name} placed Order {order_id}. Payment was authorized via verified PayPal account {dispute.get('customer_email')}.

2. Shipment & Carrier Telemetry:
The merchandise ({dispute.get('product_name')}) was packed and dispatched to the confirmed recipient delivery address on file. Carrier records substantiate intake and transit.

3. Evidence Attachments & Policy Compliance:
We have indexed and attached all verified documentation from our merchant repository, including the commercial invoice and dispatch telemetry."""

            if contradictions:
                draft += f"""

4. Noted Inconsistencies & Review Context:
Our automated audit noted: {contradictions[0].get('description')}. We urge PayPal claims adjudicators to review the official carrier tracking manifest."""
            else:
                draft += """

4. Resolution Request:
All transaction details align with PayPal Seller Protection guidelines. We respectfully request this dispute be decided in the merchant's favor."""

            draft += """

Sincerely,
Acme Store Merchant Operations"""

        summary = f"Multi-agent investigation completed for dispute {dispute_id} ({reason}). Evaluated {len(evidence_list)} supporting records against PayPal Seller Protection criteria."
        if missing:
            summary += f" Identified {len(missing)} missing items requiring merchant attention before final submission."

        recommendations = "Review the synthesized rebuttal text. Verify tracking GPS coordinates, obtain signature proof if amount >= $750, and explicitly click 'Approve Draft' prior to PayPal API submission."

        return {
            "response_draft": draft,
            "investigation_summary": summary,
            "recommendations": recommendations,
            "workflow_status": "COMPLETED"
        }

response_generation_agent = ResponseGenerationAgent()
