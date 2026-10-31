import uuid
from typing import Dict, Any, Optional, List
from app.integrations.paypal.client import paypal_client
from app.integrations.paypal.exceptions import PayPalDisputeActionNotAllowed, PayPalAPIError

class PayPalDisputesService:
    async def list_disputes(
        self,
        dispute_state: Optional[str] = None,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Fetch customer disputes from PayPal Sandbox API"""
        params = {"page_size": str(page_size)}
        if dispute_state:
            params["dispute_state"] = dispute_state
        
        try:
            return await paypal_client._request(
                method="GET",
                endpoint="/v1/customer/disputes",
                params=params
            )
        except PayPalAPIError as exc:
            if exc.status_code == 403:
                # 403 Forbidden indicates Dispute API scope is not enabled for the sandbox app
                return {
                    "items": [],
                    "total_items": 0,
                    "warning": "PayPal 403 Forbidden: Ensure Customer Disputes permission is enabled on your PayPal Developer App."
                }
            raise

    async def get_dispute(self, dispute_id: str) -> Dict[str, Any]:
        """Fetch single dispute details from PayPal"""
        return await paypal_client._request(
            method="GET",
            endpoint=f"/v1/customer/disputes/{dispute_id}"
        )

    async def provide_evidence(
        self,
        dispute_id: str,
        note: str,
        evidence_type: str = "OTHER",
        tracking_number: Optional[str] = None,
        carrier_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Submit rebuttal evidence to PayPal Customer Disputes API"""
        # First verify the dispute state and permitted action links
        dispute_details = await self.get_dispute(dispute_id)
        
        links = dispute_details.get("links", [])
        evidence_link = next((l for l in links if l.get("rel") == "provide_evidence"), None)
        
        if not evidence_link and dispute_details.get("status") not in ("WAITING_FOR_SELLER_RESPONSE", "UNDER_REVIEW"):
            raise PayPalDisputeActionNotAllowed(
                f"Dispute {dispute_id} does not currently permit evidence submission (Status: {dispute_details.get('status')})"
            )

        payload = {
            "note": note,
            "evidence_type": evidence_type
        }
        if tracking_number:
            payload["tracking_number"] = tracking_number
        if carrier_name:
            payload["carrier_name"] = carrier_name

        idempotency_key = f"evd-{dispute_id}-{uuid.uuid4().hex[:6]}"
        return await paypal_client._request(
            method="POST",
            endpoint=f"/v1/customer/disputes/{dispute_id}/provide-evidence",
            json_data=payload,
            idempotency_key=idempotency_key
        )

paypal_disputes = PayPalDisputesService()
