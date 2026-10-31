from typing import Dict, Any, List
from app.graph.state import InvestigationState

class PolicyAnalysisAgent:
    """Agent 3: Analyzes refund/return policy terms and PayPal Seller Protection eligibility rules"""

    def run(self, state: InvestigationState) -> Dict[str, Any]:
        amount = state.target_amount
        policies = [
            {
                "clause": "Fulfillment by Carrier Scan",
                "source": "Store Terms of Service §4.1",
                "applicability": "Merchant liability ceases upon validated carrier intake scan and positive dispatch telemetry."
            },
            {
                "clause": "Lost-in-Transit Notice Window",
                "source": "Merchant Return Policy §4.2",
                "applicability": "Buyer claims regarding undelivered merchandise require a carrier tracer ticket within 14 calendar days of expected delivery."
            }
        ]

        if amount >= 750.0:
            policies.append({
                "clause": "PayPal Seller Protection Signature Mandate §3.1",
                "source": "PayPal User Agreement / Seller Protection",
                "applicability": f"Orders with total value of ${amount:.2f} USD (>= $750 threshold) require physical or electronic signature confirmation from recipient."
            })
        else:
            policies.append({
                "clause": "PayPal Seller Protection Online Tracking §3.0",
                "source": "PayPal User Agreement",
                "applicability": "Proof of delivery showing delivery address matches PayPal transaction record satisfies Seller Protection requirement."
            })

        return {"policy_clauses": policies}

policy_analysis_agent = PolicyAnalysisAgent()
