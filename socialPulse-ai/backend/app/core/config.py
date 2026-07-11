"""
app/core/config.py
──────────────────
Centralised application settings using Pydantic BaseSettings.
All values are read from environment variables (or .env file).
"""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ─────────────────────────────────────────────────────────────────────
    APP_NAME: str = "SocialPulse AI"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "info"

    # ── Security ────────────────────────────────────────────────────────────────
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ────────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ── MongoDB ─────────────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "socialpulse"
    MONGODB_MAX_CONNECTIONS: int = 10
    MONGODB_MIN_CONNECTIONS: int = 1

    # ── Redis ───────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ── IBM Cloud ───────────────────────────────────────────────────────────────
    IBM_CLOUD_API_KEY: str = ""
    IBM_CLOUD_REGION: str = "us-south"

    # ── IBM Granite / watsonx.ai ────────────────────────────────────────────────
    WATSONX_URL: str = "https://us-south.ml.cloud.ibm.com"
    WATSONX_PROJECT_ID: str = ""
    WATSONX_MODEL_ID: str = "ibm/granite-13b-instruct-v2"
    WATSONX_MAX_NEW_TOKENS: int = 1024
    WATSONX_TEMPERATURE: float = 0.7
    WATSONX_TOP_P: float = 0.9

    # ── IBM Langflow ────────────────────────────────────────────────────────────
    LANGFLOW_BASE_URL: str = "http://localhost:7860"
    LANGFLOW_FLOW_ID: str = ""
    LANGFLOW_API_KEY: str = ""

    # ── IBM Watson NLP ──────────────────────────────────────────────────────────
    WATSON_NLP_URL: str = ""
    WATSON_NLP_API_KEY: str = ""
    WATSON_NLP_VERSION: str = "2022-04-07"

    # ── OAuth ───────────────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # ── Reports ─────────────────────────────────────────────────────────────────
    REPORTS_DIR: str = "/app/reports"


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()


# Module-level singleton used throughout the app
settings = get_settings()
