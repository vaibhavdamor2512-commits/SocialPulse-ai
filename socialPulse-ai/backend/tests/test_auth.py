"""
tests/test_auth.py
───────────────────
Unit + integration tests for all authentication endpoints:
  POST /api/v1/auth/signup
  POST /api/v1/auth/login
  GET  /api/v1/auth/me
  PUT  /api/v1/auth/me
"""

import pytest
from httpx import AsyncClient

# ── Fixtures ───────────────────────────────────────────────────────────────────
SIGNUP_URL = "/api/v1/auth/signup"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"

VALID_USER = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "secure123",
}


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  POST /auth/signup                                                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_signup_success(async_client: AsyncClient) -> None:
    """Happy path: valid payload returns 201 with a user object."""
    resp = await async_client.post(SIGNUP_URL, json=VALID_USER)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["email"] == VALID_USER["email"]
    assert data["name"] == VALID_USER["name"]
    assert "password_hash" not in data
    assert "id" in data
    assert data["plan"] == "free"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_signup_duplicate_email(async_client: AsyncClient) -> None:
    """Registering the same email twice returns 409."""
    await async_client.post(SIGNUP_URL, json=VALID_USER)
    resp = await async_client.post(SIGNUP_URL, json=VALID_USER)
    assert resp.status_code == 409
    assert "already exists" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_signup_invalid_email(async_client: AsyncClient) -> None:
    """Invalid email format returns 422."""
    resp = await async_client.post(
        SIGNUP_URL, json={**VALID_USER, "email": "not-an-email"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_signup_password_too_short(async_client: AsyncClient) -> None:
    """Password under 8 chars returns 422."""
    resp = await async_client.post(
        SIGNUP_URL, json={**VALID_USER, "password": "abc1"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_signup_password_all_digits(async_client: AsyncClient) -> None:
    """All-digit password returns 422 (must contain letters)."""
    resp = await async_client.post(
        SIGNUP_URL, json={**VALID_USER, "password": "12345678"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_signup_password_all_letters(async_client: AsyncClient) -> None:
    """All-letter password returns 422 (must contain digits)."""
    resp = await async_client.post(
        SIGNUP_URL, json={**VALID_USER, "password": "abcdefgh"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_signup_missing_name(async_client: AsyncClient) -> None:
    """Missing name field returns 422."""
    resp = await async_client.post(
        SIGNUP_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]}
    )
    assert resp.status_code == 422


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  POST /auth/login                                                           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient) -> None:
    """Happy path: valid credentials return access + refresh tokens."""
    await async_client.post(SIGNUP_URL, json=VALID_USER)
    resp = await async_client.post(
        LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]}
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient) -> None:
    """Wrong password returns 401."""
    await async_client.post(SIGNUP_URL, json=VALID_USER)
    resp = await async_client.post(
        LOGIN_URL, json={"email": VALID_USER["email"], "password": "wrongpass99"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(async_client: AsyncClient) -> None:
    """Unknown email returns 401 (same as wrong password — no enumeration)."""
    resp = await async_client.post(
        LOGIN_URL, json={"email": "nobody@example.com", "password": "somepass1"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_email_case_insensitive(async_client: AsyncClient) -> None:
    """Login email matching is case-insensitive."""
    await async_client.post(SIGNUP_URL, json=VALID_USER)
    resp = await async_client.post(
        LOGIN_URL,
        json={"email": VALID_USER["email"].upper(), "password": VALID_USER["password"]},
    )
    assert resp.status_code == 200


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  GET /auth/me                                                               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

async def _register_and_login(client: AsyncClient) -> str:
    """Helper: sign up + log in, return the access token."""
    await client.post(SIGNUP_URL, json=VALID_USER)
    resp = await client.post(
        LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]}
    )
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_get_me_success(async_client: AsyncClient) -> None:
    """Authenticated GET /me returns the user profile."""
    token = await _register_and_login(async_client)
    resp = await async_client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["email"] == VALID_USER["email"]
    assert "password_hash" not in data
    assert "id" in data


@pytest.mark.asyncio
async def test_get_me_no_token(async_client: AsyncClient) -> None:
    """Unauthenticated GET /me returns 403 (no credentials provided)."""
    resp = await async_client.get(ME_URL)
    # HTTPBearer with auto_error=False → our handler raises 401
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_me_invalid_token(async_client: AsyncClient) -> None:
    """Tampered token returns 401."""
    resp = await async_client.get(
        ME_URL, headers={"Authorization": "Bearer thisisnotavalidtoken"}
    )
    assert resp.status_code == 401


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  PUT /auth/me                                                               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

@pytest.mark.asyncio
async def test_update_me_name(async_client: AsyncClient) -> None:
    """Authenticated PUT /me updates the user's name."""
    token = await _register_and_login(async_client)
    resp = await async_client.put(
        ME_URL,
        json={"name": "Updated Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_update_me_ai_config(async_client: AsyncClient) -> None:
    """Updating AI config persists correctly."""
    token = await _register_and_login(async_client)
    resp = await async_client.put(
        ME_URL,
        json={"ai_config": {"temperature": 0.9, "model": "ibm/granite-13b-instruct-v2", "language": "en", "max_tokens": 512}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["ai_config"]["temperature"] == 0.9


@pytest.mark.asyncio
async def test_update_me_empty_body(async_client: AsyncClient) -> None:
    """PUT /me with no fields returns 422."""
    token = await _register_and_login(async_client)
    resp = await async_client.put(
        ME_URL,
        json={},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_update_me_unauthenticated(async_client: AsyncClient) -> None:
    """PUT /me without token returns 401."""
    resp = await async_client.put(ME_URL, json={"name": "Hacker"})
    assert resp.status_code in (401, 403)
