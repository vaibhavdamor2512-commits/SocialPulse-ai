"""
tests/test_feature_routers.py
──────────────────────────────
Integration tests for all Phase 3 feature routers.
All tests use the mongomock-motor in-memory DB injected via conftest fixtures.
Tests verify status codes, response shapes, and auth enforcement.
"""

import pytest
from httpx import AsyncClient

# ── Re-use auth helpers from test_auth ────────────────────────────────────────
SIGNUP_URL = "/api/v1/auth/signup"
LOGIN_URL  = "/api/v1/auth/login"

VALID_USER = {
    "name": "Feature Tester",
    "email": "feature@example.com",
    "password": "featuretest1",
}


async def _get_token(client: AsyncClient) -> str:
    await client.post(SIGNUP_URL, json=VALID_USER)
    resp = await client.post(
        LOGIN_URL,
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    return resp.json()["access_token"]


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Analytics                                                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_analytics_overview_success(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/analytics/overview", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "total_followers" in data
    assert "platforms" in data
    assert "followers_timeline" in data


@pytest.mark.asyncio
async def test_analytics_overview_period(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get(
        "/api/v1/analytics/overview?period=7d", headers=auth(token)
    )
    assert resp.status_code == 200
    assert resp.json()["period"] == "7d"


@pytest.mark.asyncio
async def test_analytics_overview_invalid_period(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get(
        "/api/v1/analytics/overview?period=999d", headers=auth(token)
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_analytics_sentiment(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/analytics/sentiment", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "overall_score" in data
    assert "label" in data
    assert "breakdown" in data


@pytest.mark.asyncio
async def test_analytics_trending_hashtags(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get(
        "/api/v1/analytics/hashtags/trending?limit=5", headers=auth(token)
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "hashtags" in data
    assert len(data["hashtags"]) <= 5


@pytest.mark.asyncio
async def test_analytics_best_posting_times(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get(
        "/api/v1/analytics/best-posting-times", headers=auth(token)
    )
    assert resp.status_code == 200
    assert "posting_times" in resp.json()


@pytest.mark.asyncio
async def test_analytics_platform_comparison(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get(
        "/api/v1/analytics/platform-comparison?metric=followers", headers=auth(token)
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["metric"] == "followers"
    assert "comparison" in data


@pytest.mark.asyncio
async def test_analytics_requires_auth(async_client: AsyncClient) -> None:
    resp = await async_client.get("/api/v1/analytics/overview")
    assert resp.status_code in (401, 403)


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Assistant                                                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_assistant_chat(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/assistant/chat",
        json={"message": "Write an Instagram caption for a product launch"},
        headers=auth(token),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert len(data["response"]) > 0
    assert "session_id" in data
    assert "model" in data


@pytest.mark.asyncio
async def test_assistant_chat_with_platform(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/assistant/chat",
        json={
            "message": "Write a LinkedIn post",
            "platform": "linkedin",
            "content_type": "thought_leadership",
        },
        headers=auth(token),
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_assistant_chat_empty_message(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/assistant/chat",
        json={"message": ""},
        headers=auth(token),
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_assistant_generate(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/assistant/generate",
        json={
            "prompt": "Write a tweet about AI innovation",
            "platform": "twitter",
            "content_type": "tweet",
        },
        headers=auth(token),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "content" in data
    assert "suggested_hashtags" in data


@pytest.mark.asyncio
async def test_assistant_requires_auth(async_client: AsyncClient) -> None:
    resp = await async_client.post(
        "/api/v1/assistant/chat",
        json={"message": "Hello"},
    )
    assert resp.status_code in (401, 403)


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Campaigns                                                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_campaigns_list(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/campaigns/", headers=auth(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_campaigns_create(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/campaigns/",
        json={
            "name": "Test Campaign",
            "objective": "brand_awareness",
            "budget": 5000,
            "start_date": "2024-08-01",
            "end_date": "2024-08-31",
            "platforms": ["instagram"],
            "target_audience": "18-35 tech users",
        },
        headers=auth(token),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Campaign"
    assert data["status"] == "draft"
    assert "id" in data


@pytest.mark.asyncio
async def test_campaigns_get_by_id(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    create_resp = await async_client.post(
        "/api/v1/campaigns/",
        json={
            "name": "Fetch Me",
            "objective": "conversion",
            "budget": 1000,
            "start_date": "2024-09-01",
            "end_date": "2024-09-30",
            "platforms": ["twitter"],
            "target_audience": "All ages",
        },
        headers=auth(token),
    )
    campaign_id = create_resp.json()["id"]
    resp = await async_client.get(f"/api/v1/campaigns/{campaign_id}", headers=auth(token))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Fetch Me"


@pytest.mark.asyncio
async def test_campaigns_generate_strategy(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/campaigns/generate",
        json={
            "campaign_name": "AI Strategy Test",
            "objective": "brand_awareness",
            "budget": 10000,
            "target_audience": "Tech professionals",
            "platforms": ["instagram", "linkedin"],
            "duration_days": 30,
        },
        headers=auth(token),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "strategy" in data
    assert len(data["strategy"]) > 0
    assert "ai_score" in data


@pytest.mark.asyncio
async def test_campaigns_requires_auth(async_client: AsyncClient) -> None:
    resp = await async_client.get("/api/v1/campaigns/")
    assert resp.status_code in (401, 403)


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Competitors                                                                ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_competitors_list(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/competitors/", headers=auth(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) > 0


@pytest.mark.asyncio
async def test_competitors_swot(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/competitors/swot", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "structured" in data
    assert "strengths" in data["structured"]
    assert "analysis" in data


@pytest.mark.asyncio
async def test_competitors_recommendations(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/competitors/recommendations", headers=auth(token))
    assert resp.status_code == 200
    recs = resp.json()
    assert isinstance(recs, list)
    assert len(recs) > 0
    assert "title" in recs[0]


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Influencers                                                                ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_influencers_list(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/influencers/", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_influencers_network(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/influencers/network", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0


@pytest.mark.asyncio
async def test_influencers_collab_score(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get(
        "/api/v1/influencers/sarahchen_tech/score", headers=auth(token)
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "overall_score" in data
    assert "score_breakdown" in data
    assert "ai_recommendation" in data


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Notifications                                                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_notifications_list(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/notifications/", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "notifications" in data
    assert "unread_count" in data
    assert isinstance(data["notifications"], list)


@pytest.mark.asyncio
async def test_notifications_create_alert(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/notifications/alert",
        json={
            "type": "test_alert",
            "title": "Test Notification",
            "body": "This is a test alert.",
            "severity": "info",
        },
        headers=auth(token),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test Notification"
    assert data["read"] is False


@pytest.mark.asyncio
async def test_notifications_mark_read(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    # Create then mark read
    create_resp = await async_client.post(
        "/api/v1/notifications/alert",
        json={"type": "test", "title": "Mark Me", "body": "Read this.", "severity": "info"},
        headers=auth(token),
    )
    notif_id = create_resp.json()["id"]
    resp = await async_client.put(
        f"/api/v1/notifications/{notif_id}/read", headers=auth(token)
    )
    assert resp.status_code == 200
    assert resp.json()["read"] is True


@pytest.mark.asyncio
async def test_notifications_mark_all_read(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    # Seed by listing first
    await async_client.get("/api/v1/notifications/", headers=auth(token))
    resp = await async_client.put(
        "/api/v1/notifications/read-all", headers=auth(token)
    )
    assert resp.status_code == 200
    assert "marked_read" in resp.json()


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Trends                                                                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_trends_list(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/trends/", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "predictions" in data
    assert len(data["predictions"]) > 0


@pytest.mark.asyncio
async def test_trends_forecast(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/trends/forecast?weeks=6", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "forecast" in data
    assert len(data["forecast"]) > 0


@pytest.mark.asyncio
async def test_trends_virality(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/trends/virality", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "predictions" in data
    assert len(data["predictions"]) > 0


@pytest.mark.asyncio
async def test_trends_hashtag_deep_dive(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/trends/hashtag/AIContent", headers=auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "hashtag" in data
    assert "direction" in data


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Reports                                                                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_reports_list(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.get("/api/v1/reports/", headers=auth(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_reports_generate_csv(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/reports/generate",
        json={
            "report_type": "analytics_summary",
            "format": "csv",
            "period": "last_30_days",
            "include_ai_summary": False,
        },
        headers=auth(token),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["format"] == "csv"
    assert data["status"] in ("ready", "failed")
    assert "download_url" in data


@pytest.mark.asyncio
async def test_reports_generate_invalid_type(async_client: AsyncClient) -> None:
    token = await _get_token(async_client)
    resp = await async_client.post(
        "/api/v1/reports/generate",
        json={"report_type": "invalid_type", "format": "csv", "period": "last_30_days"},
        headers=auth(token),
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_reports_requires_auth(async_client: AsyncClient) -> None:
    resp = await async_client.get("/api/v1/reports/")
    assert resp.status_code in (401, 403)
