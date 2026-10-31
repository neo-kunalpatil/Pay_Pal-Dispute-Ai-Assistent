from typing import Dict, Any
from app.core.config import settings
from app.integrations.paypal.client import paypal_client

class PayPalWebhooksService:
    async def verify_signature(
        self,
        headers: Dict[str, str],
        body_json: Dict[str, Any]
    ) -> bool:
        """Verify webhook signature against PayPal REST API"""
        if not settings.PAYPAL_WEBHOOK_ID:
            # In sandbox dev mode when webhook ID isn't registered yet, log and permit
            return True

        verify_payload = {
            "transmission_id": headers.get("paypal-transmission-id"),
            "transmission_time": headers.get("paypal-transmission-time"),
            "cert_url": headers.get("paypal-cert-url"),
            "auth_algo": headers.get("paypal-auth-algo"),
            "transmission_sig": headers.get("paypal-transmission-sig"),
            "webhook_id": settings.PAYPAL_WEBHOOK_ID,
            "webhook_event": body_json
        }

        try:
            result = await paypal_client._request(
                method="POST",
                endpoint="/v1/notifications/verify-webhook-signature",
                json_data=verify_payload
            )
            return result.get("verification_status") == "SUCCESS"
        except Exception:
            return False

paypal_webhooks = PayPalWebhooksService()
