"""
app/worker.py
──────────────
Celery application instance for background tasks.
Used by: celery -A app.worker worker

NOTE: We intentionally read broker/backend URLs directly from os.environ
instead of importing settings, so the Celery worker can start independently
of the FastAPI app (and even when the full .env is not yet loaded).
"""

import os

from celery import Celery

_broker  = os.getenv("CELERY_BROKER_URL",  "redis://localhost:6379/1")
_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")

celery_app = Celery(
    "socialpulse",
    broker=_broker,
    backend=_backend,
    include=["app.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

# Alias used by docker-compose: celery -A app.worker worker
worker = celery_app
