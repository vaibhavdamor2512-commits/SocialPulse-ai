# SocialPulse AI — Architecture Overview

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Internet / Browser                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ :80
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy (Docker)                     │
│  /api/* ──► backend:8000      /*  ──► frontend:3000                │
└───────────────┬─────────────────────────┬───────────────────────────┘
                │                         │
                ▼                         ▼
┌──────────────────────┐    ┌──────────────────────────────────────────┐
│  FastAPI Backend     │    │  Next.js 14 Frontend                     │
│  Python 3.12         │    │  React 18 + TypeScript                   │
│  Pydantic v2         │    │  Tailwind CSS + Framer Motion            │
│  Motor (async)       │    │  Recharts + D3.js                        │
│  JWT auth            │    │  TanStack Query + Zustand                │
└───────┬──────┬───────┘    └──────────────────────────────────────────┘
        │      │
        │      ▼
        │  ┌────────────────────────────────────────────────────────┐
        │  │              IBM AI Layer                              │
        │  │                                                        │
        │  │  ┌─────────────────────────────────────────────────┐  │
        │  │  │  IBM Langflow Agent Pipeline                    │  │
        │  │  │  Chat Input → System Prompt → Granite 13B       │  │
        │  │  │  → Agent Executor (+ Buffer Memory)             │  │
        │  │  │  → Watson NLP Tool → Chat Output                │  │
        │  │  └─────────────────────────────────────────────────┘  │
        │  │                                                        │
        │  │  IBM Granite 13B Instruct v2 (watsonx.ai)             │
        │  │  IBM Watson NLP (Natural Language Understanding)       │
        │  └────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Data Layer (Docker)                             │
│                                                                      │
│  MongoDB 7.0                    Redis 7.4                            │
│  ┌────────────────┐             ┌──────────────────────────────────┐ │
│  │ users          │             │ db/0  API response cache         │ │
│  │ posts          │             │ db/1  Celery broker              │ │
│  │ analytics_snap │             │ db/2  Celery results             │ │
│  │ campaigns      │             └──────────────────────────────────┘ │
│  │ competitors    │                                                   │
│  │ ai_conversations│                                                  │
│  │ notifications  │                                                   │
│  └────────────────┘                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

## Request Flow — AI Chat

```
User types message
      │
      ▼
Next.js /assistant page
  POST /api/v1/assistant/chat
      │
      ▼
FastAPI assistant.py router
  Validates JWT, extracts user_id
      │
      ▼
IBM Langflow HTTP API
  POST /api/v1/run/{flow_id}
  payload: { input_value, session_id, platform, content_type }
      │
      ▼
Langflow Agent Pipeline
  1. Chat Input node receives message
  2. System Prompt injects social media context
  3. IBM Granite 13B generates reasoning
  4. Agent Executor decides: use tool or respond?
     a. Watson NLP Tool called if sentiment needed
     b. Buffer Memory preserves conversation context
  5. Chat Output returns final response
      │
      ▼
FastAPI saves to ai_conversations collection
      │
      ▼
Response streamed back to Next.js
      │
      ▼
Chat UI renders assistant message
```

## Data Flow — Analytics Dashboard

```
Next.js /dashboard
  useQuery(['analytics', 'overview'])
      │
      ▼
FastAPI GET /api/v1/analytics/overview
  Check Redis cache (TTL: 5 min)
      │ cache miss
      ▼
MongoDB aggregation pipeline
  analytics_snapshots collection
  posts collection (engagement metrics)
      │
      ▼
Watson NLP called for sentiment score
      │
      ▼
Response cached in Redis
      │
      ▼
JSON response → TanStack Query cache
      │
      ▼
Recharts renders charts
```

## Authentication Flow

```
User submits login form
      │
      ▼
POST /api/v1/auth/login
  Validates credentials against MongoDB (bcrypt)
      │
      ▼
FastAPI issues JWT access token (60 min) + refresh token (7 days)
      │
      ▼
Tokens stored in httpOnly cookies (Next.js middleware manages them)
      │
      ▼
Subsequent API calls include Authorization: Bearer <token>
FastAPI verifies JWT on every protected route (Depends(get_current_user))
```
