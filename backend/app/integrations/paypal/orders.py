import uuid
from typing import Dict, Any, Optional
from app.integrations.paypal.client import paypal_client

class PayPalOrdersService:
    async def create_order(
        self,
        product_name: str,
        amount: float,
        currency: str = "USD",
        order_number: Optional[str] = None,
        return_url: Optional[str] = None,
        cancel_url: Optional[str] = None
    ) -> Dict[str, Any]:
        order_ref = order_number or f"ORD-{uuid.uuid4().hex[:6].upper()}"
        idempotency_key = f"order-create-{uuid.uuid4()}"

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": order_ref,
                    "description": product_name,
                    "amount": {
                        "currency_code": currency,
                        "value": f"{amount:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": f"{amount:.2f}"
                            }
                        }
                    },
                    "items": [
                        {
                            "name": product_name,
                            "unit_amount": {
                                "currency_code": currency,
                                "value": f"{amount:.2f}"
                            },
                            "quantity": "1"
                        }
                    ]
                }
            ],
            "application_context": {
                "brand_name": "DisputePilot AI Merchant",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "return_url": return_url or "http://localhost:5173",
                "cancel_url": cancel_url or "http://localhost:5173"
            }
        }

        result = await paypal_client._request(
            method="POST",
            endpoint="/v2/checkout/orders",
            json_data=payload,
            idempotency_key=idempotency_key
        )
        return result

    async def capture_order(self, order_id: str) -> Dict[str, Any]:
        idempotency_key = f"capture-{order_id}-{uuid.uuid4().hex[:6]}"
        result = await paypal_client._request(
            method="POST",
            endpoint=f"/v2/checkout/orders/{order_id}/capture",
            idempotency_key=idempotency_key
        )
        return result

    async def get_order(self, order_id: str) -> Dict[str, Any]:
        return await paypal_client._request(
            method="GET",
            endpoint=f"/v2/checkout/orders/{order_id}"
        )

paypal_orders = PayPalOrdersService()
