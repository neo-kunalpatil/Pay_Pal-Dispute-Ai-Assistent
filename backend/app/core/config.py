import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "DisputePilot AI"
    APP_ENV: str = "development"
    APP_MODE: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "dispute_pilot_super_secret_jwt_key_2026_dev_env_minimum_32_characters_long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    DATABASE_URL: str = "sqlite:///./disputepilot.db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # PayPal configuration
    PAYPAL_MODE: str = "sandbox"
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    PAYPAL_WEBHOOK_ID: Optional[str] = None

    # AI & RAG configuration (pgvector)
    AI_MODE: str = "mock"  # 'mock' or 'real'
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    EMBEDDING_PROVIDER: str = "sentence_transformers"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    VECTOR_STORE: str = "pgvector"

    # Storage
    STORAGE_TYPE: str = "local"
    UPLOAD_DIRECTORY: str = "storage/uploads"
    MAX_UPLOAD_SIZE_MB: int = 20

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"]
        return list(set(origins))

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
