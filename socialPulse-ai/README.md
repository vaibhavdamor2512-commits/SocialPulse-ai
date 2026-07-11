# SocialPulse AI

> **IBM AI Hackathon 2024** — Intelligent Social Media Agent  
> Powered by IBM Granite 13B · IBM Langflow · IBM Watson NLP

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Quick Start (Docker)](#quick-start-docker)
7. [Local Development](#local-development)
8. [Environment Variables](#environment-variables)
9. [API Reference](#api-reference)
10. [IBM AI Integration](#ibm-ai-integration)
11. [Database Schema](#database-schema)
12. [Contributing](#contributing)

---

## Overview

SocialPulse AI is a full-stack SaaS platform that helps brands and marketers:

- **Monitor** cross-platform social media analytics in real-time
- **Generate** AI-written content via IBM Granite 13B (captions, threads, posts, campaigns)
- **Analyze** sentiment and emotions with IBM Watson NLP
- **Predict** trends and virality scores with 6-week forecasting
- **Plan** campaigns with AI-generated strategies and ROAS tracking
- **Map** influencer networks with AI collaboration scoring
- **Report** with PDF, Excel, and CSV export

---

## Architecture

```
Browser
  │
  ▼
Nginx (port 80)
  ├─── /api/*  ──────► FastAPI (port 8000)
  │                        ├── MongoDB (Motor)
  │                        ├── Redis (cache + Celery)
  │                        ├── IBM Langflow ──► IBM Granite 13B
  │                        └── IBM Watson NLP
  └─── /*  ──────────► Next.js 14 (port 3000)
```

### IBM Langflow Pipeline

```
Chat Input ──► System Prompt ──► IBM Granite 13B ──► Agent Executor ──► Chat Output
                                                           │
                                          ┌────────────────┤
                                     Buffer Memory    Watson NLP Tool
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Charts | Recharts, D3.js |
| State | Zustand, TanStack Query |
| Backend | FastAPI, Python 3.12, Pydantic v2 |
| Database | MongoDB 7.0 (Motor async driver) |
| Cache / Queue | Redis 7.4 + Celery |
| Auth | JWT (jose) + Bcrypt |
| IBM AI | Granite 13B Instruct v2, Langflow, Watson NLP |
| Infrastructure | Docker, Docker Compose, Nginx |

---

## Project Structure

```
socialPulse-ai/
├── frontend/                    # Next.js 14 App Router
│   ├── src/app/                 # 12 pages
│   ├── src/components/layout/   # Sidebar, Header, DashboardLayout
│   ├── src/lib/                 # mockData, utils, api client
│   ├── src/types/               # TypeScript interfaces
│   └── src/store/               # Zustand stores
├── backend/                     # FastAPI Python API
│   ├── main.py                  # Entry point
│   └── app/
│       ├── core/                # config, database, security
│       ├── models/              # Pydantic schemas
│       └── routers/             # 8 route modules
├── langflow/
│   └── socialpulse_workflow.json
├── docker/
│   ├── nginx.conf
│   └── mongo-init.js
├── docs/                        # Architecture diagrams, API docs
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Prerequisites

- Docker ≥ 24 and Docker Compose ≥ 2.20
- IBM Cloud account with:
  - watsonx.ai project (Granite 13B Instruct v2)
  - Watson Natural Language Understanding service
  - IBM Langflow instance (or self-hosted)
- Node.js ≥ 20 (for local frontend dev)
- Python ≥ 3.12 (for local backend dev)

---

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/your-org/socialpulse-ai
cd socialpulse-ai

# 2. Configure environment variables
cp .env.example .env
# → Edit .env and fill in IBM API keys and a strong SECRET_KEY

# 3. Build and start all services
docker-compose up --build

# 4. Access the app
# Frontend:  http://localhost:3000
# API:       http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env          # fill in values
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local    # set NEXT_PUBLIC_API_URL etc.
npm run dev
```

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Critical values:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key — generate with `openssl rand -hex 32` |
| `IBM_CLOUD_API_KEY` | IBM Cloud IAM API key |
| `WATSONX_PROJECT_ID` | watsonx.ai project ID |
| `WATSONX_URL` | watsonx.ai regional endpoint |
| `WATSON_NLP_URL` | Watson NLU service URL |
| `WATSON_NLP_API_KEY` | Watson NLU API key |
| `LANGFLOW_FLOW_ID` | Deployed Langflow flow ID |

---

## API Reference

Interactive docs available at `http://localhost:8000/docs` (Swagger UI).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | JWT authentication |
| GET | `/api/v1/auth/me` | Current user profile |
| GET | `/api/v1/analytics/overview` | Cross-platform metrics |
| GET | `/api/v1/analytics/sentiment` | Watson NLP sentiment |
| GET | `/api/v1/analytics/hashtags/trending` | Trending hashtags |
| GET | `/api/v1/analytics/best-posting-times` | Optimal post schedule |
| POST | `/api/v1/assistant/chat` | IBM Granite chat |
| POST | `/api/v1/assistant/analyze-image` | Image caption generation |
| GET | `/api/v1/campaigns/` | List campaigns |
| POST | `/api/v1/campaigns/generate` | AI campaign strategy |
| GET | `/api/v1/competitors/swot` | Granite SWOT analysis |
| GET | `/api/v1/influencers/` | List influencers |
| GET | `/api/v1/influencers/{id}/score` | AI collaboration score |
| POST | `/api/v1/reports/generate` | Generate PDF/Excel/CSV |
| GET | `/api/v1/trends/` | Trend predictions |
| GET | `/api/v1/notifications/` | User notifications |
| PUT | `/api/v1/settings/` | Update user settings |

---

## IBM AI Integration

### IBM Granite 13B (watsonx.ai)
Used for: content generation, campaign strategy, SWOT analysis, trend prediction, hashtag suggestions.

### IBM Langflow
Orchestrates the Granite agent with buffer memory, Watson NLP tool, and multi-step reasoning. Import `langflow/socialpulse_workflow.json` into your Langflow instance.

### IBM Watson NLP (Natural Language Understanding)
Used for: real-time sentiment scoring, emotion detection, entity extraction, keyword analysis, competitor sentiment tracking.

---

## Database Schema

| Collection | Purpose |
|------------|---------|
| `users` | User accounts, platform connections, AI config |
| `posts` | Social media posts with engagement metrics |
| `analytics_snapshots` | Daily per-platform analytics |
| `campaigns` | Campaign records with AI strategies |
| `competitors` | Competitor profiles and metrics |
| `ai_conversations` | Chat history per session |
| `notifications` | Real-time alerts (TTL: 30 days) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push and open a Pull Request

---

*SocialPulse AI · IBM AI Hackathon 2024 · Powered by IBM Granite, Langflow & Watson NLP*
