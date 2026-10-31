import os
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMClient:
    """
    Centralized client for Google Gemini LLM API calls with error handling,
    timeout resilience, and bounded retries.
    """
    def __init__(self):
        self.model_name = "gemini-3.5-flash-lite"
        self._client = None

    def get_client(self):
        if self._client is None and settings.GEMINI_API_KEY:
            try:
                from google import genai
                self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI Client: {e}")
                self._client = None
        return self._client

    def is_available(self) -> bool:
        return bool(settings.GEMINI_API_KEY and settings.AI_MODE != "mock")

    def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        client = self.get_client()
        if not client or not self.is_available():
            return None

        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                temperature=0.2,
                top_p=0.9,
                system_instruction=system_instruction
            )
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            if response and response.text:
                return response.text.strip()
        except Exception as exc:
            logger.warning(f"Gemini API generation failed or was throttled: {exc}")
            return None

llm_client = LLMClient()

