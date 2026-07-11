# SocialPulse AI — API Documentation

> Base URL: `http://localhost:8000/api/v1`  
> Interactive Swagger UI: `http://localhost:8000/docs`  
> ReDoc: `http://localhost:8000/redoc`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from `POST /auth/login` and expire after 60 minutes.

---

## Endpoints

### Auth

#### POST /auth/signup
Register a new user account.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response 201:**
```json
{
  "id": "64f...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "plan": "free",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

#### POST /auth/login
Authenticate and receive JWT tokens.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

#### GET /auth/me
Get the current authenticated user's profile.

**Response 200:**
```json
{
  "id": "64f...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "plan": "pro",
  "avatar_url": null,
  "connected_platforms": ["instagram", "twitter"],
  "ai_config": {
    "model": "ibm/granite-13b-instruct-v2",
    "temperature": 0.7,
    "language": "en"
  }
}
```

---

### Analytics

#### GET /analytics/overview
Returns aggregated cross-platform metrics for the authenticated user.

**Query params:** `period` (7d | 30d | 90d, default: 30d)

**Response 200:**
```json
{
  "total_followers": 124500,
  "total_reach": 890000,
  "avg_engagement_rate": 4.2,
  "total_posts": 347,
  "follower_growth": 12.5,
  "platforms": {
    "instagram": { "followers": 45000, "engagement": 5.1, "reach": 320000 },
    "twitter":   { "followers": 28000, "engagement": 3.8, "reach": 215000 },
    "linkedin":  { "followers": 31500, "engagement": 4.4, "reach": 198000 },
    "facebook":  { "followers": 20000, "engagement": 3.6, "reach": 157000 }
  }
}
```

---

#### GET /analytics/sentiment
Returns Watson NLP sentiment analysis for recent posts.

**Response 200:**
```json
{
  "overall_score": 84,
  "label": "positive",
  "breakdown": {
    "positive": 68,
    "neutral": 22,
    "negative": 10
  },
  "emotions": {
    "joy": 0.62,
    "trust": 0.48,
    "anticipation": 0.31
  },
  "top_keywords": ["innovation", "growth", "community"]
}
```

---

#### GET /analytics/hashtags/trending
Returns trending hashtags with engagement data.

**Response 200:**
```json
{
  "hashtags": [
    { "tag": "#TechTuesday", "posts": 1240, "reach": 85000, "trend": "up" },
    { "tag": "#AI2024",      "posts": 980,  "reach": 72000, "trend": "up" }
  ]
}
```

---

#### GET /analytics/best-posting-times
Returns AI-recommended optimal posting times per platform.

**Response 200:**
```json
{
  "instagram": [{ "day": "Tuesday", "hour": 18, "score": 92 }],
  "twitter":   [{ "day": "Wednesday", "hour": 9, "score": 88 }],
  "linkedin":  [{ "day": "Thursday", "hour": 8, "score": 91 }]
}
```

---

### Assistant (IBM Granite)

#### POST /assistant/chat
Send a message to the IBM Granite agent via Langflow.

**Request body:**
```json
{
  "message": "Write an Instagram caption for our new product launch",
  "platform": "instagram",
  "content_type": "product_launch",
  "session_id": "sess_abc123"
}
```

**Response 200:**
```json
{
  "response": "🚀 Something big is here...",
  "session_id": "sess_abc123",
  "model": "ibm/granite-13b-instruct-v2",
  "tokens_used": 312
}
```

---

#### POST /assistant/analyze-image
Generate a caption or description for an uploaded image.

**Request:** multipart/form-data with `file` field (JPEG/PNG, max 20MB)

**Response 200:**
```json
{
  "caption": "A vibrant product flat lay...",
  "suggested_hashtags": ["#ProductPhotography", "#BrandAesthetics"],
  "sentiment": "positive"
}
```

---

### Campaigns

#### GET /campaigns/
List all campaigns for the authenticated user.

#### POST /campaigns/generate
Generate an AI campaign strategy using IBM Granite.

**Request body:**
```json
{
  "campaign_name": "Summer Launch 2024",
  "objective": "brand_awareness",
  "budget": 5000,
  "target_audience": "18-34 tech enthusiasts",
  "platforms": ["instagram", "twitter"],
  "duration_days": 30
}
```

---

### Competitors

#### GET /competitors/swot
Generate a SWOT analysis for tracked competitors using IBM Granite.

---

### Influencers

#### GET /influencers/
List discovered influencers with relevance scores.

#### GET /influencers/{id}/score
Get an AI-generated collaboration score for a specific influencer.

---

### Reports

#### POST /reports/generate
Generate a report file (PDF, Excel, or CSV).

**Request body:**
```json
{
  "report_type": "analytics_summary",
  "format": "pdf",
  "period": "last_30_days",
  "platforms": ["instagram", "twitter"]
}
```

**Response 200:** Returns file download URL.

---

### Trends

#### GET /trends/
Get Granite-powered trend predictions for the next 6 weeks.

---

### Notifications

#### GET /notifications/
List unread notifications for the authenticated user.

---

### Settings

#### PUT /settings/
Update user profile, platform connections, AI configuration, and notification preferences.
