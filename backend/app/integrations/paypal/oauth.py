import time
import httpx
from typing import Optional, Tuple
from app.core.config import settings
from app.integrations.paypal.exceptions import PayPalAuthError

class PayPalOAuthManager:
    def __init__(self):
        self._cached_token: Optional[str] = None
        self._token_expires_at: float = 0.0

    def is_configured(self) -> bool:
        return bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET)

    async def get_access_token(self, force_refresh: bool = False) -> str:
        if not self.is_configured():
            raise PayPalAuthError("PayPal Client ID and Secret are not configured in backend/.env")

        current_time = time.time()
        # Use cached token if valid for at least 60 more seconds
        if not force_refresh and self._cached_token and current_time < (self._token_expires_at - 60):
            return self._cached_token

        url = f"{settings.PAYPAL_BASE_URL.rstrip('/')}/v1/oauth2/token"
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = {"grant_type": "client_credentials"}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    url,
                    auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
                    headers=headers,
                    data=data,
                )

                if response.status_code != 200:
                    raise PayPalAuthError(
                        f"Failed to authenticate with PayPal: {response.text}",
                        status_code=response.status_code
                    )

                payload = response.json()
                self._cached_token = payload.get("access_token")
                expires_in = payload.get("expires_in", 3600)
                self._token_expires_at = current_time + float(expires_in)
                return self._cached_token

        except httpx.RequestError as exc:
            raise PayPalAuthError(f"Network error communicating with PayPal OAuth: {str(exc)}")

paypal_oauth = PayPalOAuthManager()
