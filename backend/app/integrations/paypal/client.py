import uuid
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings
from app.integrations.paypal.oauth import paypal_oauth
from app.integrations.paypal.exceptions import PayPalAPIError

class PayPalClient:
    def __init__(self):
        self.base_url = settings.PAYPAL_BASE_URL.rstrip('/')

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        token = await paypal_oauth.get_access_token()
        
        req_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if idempotency_key:
            req_headers["PayPal-Request-Id"] = idempotency_key
        if headers:
            req_headers.update(headers)

        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json_data,
                    headers=req_headers
                )

                if resp.status_code in (200, 201, 204):
                    return resp.json() if resp.text else {}
                
                error_body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {"raw": resp.text}
                raise PayPalAPIError(
                    message=f"PayPal API {method} {endpoint} failed [{resp.status_code}]: {resp.text}",
                    status_code=resp.status_code,
                    details=error_body
                )
        except httpx.RequestError as exc:
            raise PayPalAPIError(f"HTTP request to PayPal failed: {str(exc)}")

    async def test_connection(self) -> Dict[str, Any]:
        """Test API connectivity by retrieving access token and checking latency"""
        import time
        start = time.time()
        token = await paypal_oauth.get_access_token(force_refresh=True)
        latency = int((time.time() - start) * 1000)
        return {
            "success": True,
            "latencyMs": latency,
            "environment": settings.PAYPAL_MODE,
            "message": "Connected to PayPal Sandbox REST API successfully. OAuth token verified.",
            "tokenValid": bool(token)
        }

paypal_client = PayPalClient()
