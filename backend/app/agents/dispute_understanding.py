import re
from typing import Dict, Any, List
from app.graph.state import InvestigationState

class DisputeUnderstandingAgent:
    """Agent 1: Deconstructs buyer claim, extracts monetary amounts, dates, and PayPal evidence rules"""

    def run(self, state: InvestigationState) -> Dict[str, Any]:
        dispute = state.dispute_details
        reason = dispute.get("reason", "Product Not Received")
        complaint = dispute.get("complaint_description") or dispute.get("customer_statement") or ""
        amount = float(dispute.get("amount", 0.0))

        # Determine evidence requirements based on dispute reason and PayPal rules
        requirements = []
        if "not received" in reason.lower():
            requirements = [
                "Proof of shipment with carrier tracking number",
                "Proof of delivery to recipient's confirmed PayPal address",
                "Official commercial invoice matching order ID"
            ]
            if amount >= 750.0:
                requirements.append("Direct signature confirmation (POD) for transactions >= $750.00 USD")
        elif "not as described" in reason.lower():
            requirements = [
                "Item specifications and product listing catalog page",
                "Customer pre-order communications",
                "Store condition report and quality assurance certificate"
            ]
        elif "unauthorised" in reason.lower():
            requirements = [
                "IP log, device fingerprint, and checkout authorization timestamp",
                "Order fulfillment confirmation sent to buyer email"
            ]
        else:
            requirements = [
                "Transaction invoice",
                "Proof of fulfillment or delivery"
            ]

        # Extract dates from complaint text if present
        date_pattern = r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:, \d{4})?\b'
        dates_found = re.findall(date_pattern, complaint, re.IGNORECASE)

        return {
            "claim_type": reason,
            "target_amount": amount,
            "evidence_requirements": requirements,
            "key_dates": {"dates_mentioned": dates_found}
        }

dispute_understanding_agent = DisputeUnderstandingAgent()
