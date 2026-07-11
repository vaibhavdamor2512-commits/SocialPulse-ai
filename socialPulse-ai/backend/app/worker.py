"""
app/worker.py
──────────────
Celery application instance for background tasks.
Used by: celery -A app.worker worker
"""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "socialpulse",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

# Alias expected by docker-compose command: celery -A app.worker worker
worker = celery_app
