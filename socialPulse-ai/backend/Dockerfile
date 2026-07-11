# ══════════════════════════════════════════════════════════════════════════════
#  SocialPulse AI — Backend Dockerfile
#  Single-stage build (optimised for fast iterative builds in dev)
# ══════════════════════════════════════════════════════════════════════════════

FROM python:3.12-slim AS base

# ── OS dependencies ────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Python env ─────────────────────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# ── Create non-root user ───────────────────────────────────────────────────────
RUN groupadd --system app && useradd --system --gid app app

# ── Working directory ──────────────────────────────────────────────────────────
WORKDIR /app

# ── Install Python dependencies ────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ── Copy application source ────────────────────────────────────────────────────
COPY . .

# ── Reports output directory ───────────────────────────────────────────────────
RUN mkdir -p /app/reports && chown app:app /app/reports

USER app

# ── Health-check ───────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
