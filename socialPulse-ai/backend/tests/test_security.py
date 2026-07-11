"""
tests/test_security.py
───────────────────────
Unit tests for the security module — JWT and password utilities.
These run without any database or network connections.
"""

import time
from datetime import timedelta

import pytest
from jose import JWTError

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_subject,
    hash_password,
    verify_password,
)


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Password hashing                                                           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

def test_hash_and_verify_correct_password() -> None:
    hashed = hash_password("mypassword1")
    assert verify_password("mypassword1", hashed) is True


def test_verify_wrong_password() -> None:
    hashed = hash_password("mypassword1")
    assert verify_password("wrongpassword", hashed) is False


def test_hash_is_not_plaintext() -> None:
    plain = "mypassword1"
    hashed = hash_password(plain)
    assert hashed != plain


def test_same_password_different_hashes() -> None:
    """bcrypt uses a random salt — same plaintext never produces the same hash."""
    h1 = hash_password("mypassword1")
    h2 = hash_password("mypassword1")
    assert h1 != h2


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  JWT — access tokens                                                        ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

def test_create_and_decode_access_token() -> None:
    user_id = "507f1f77bcf86cd799439011"
    token = create_access_token(subject=user_id)
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "access"


def test_access_token_has_exp() -> None:
    token = create_access_token(subject="user123")
    payload = decode_token(token)
    assert "exp" in payload
    assert payload["exp"] > time.time()


def test_access_token_extra_claims() -> None:
    token = create_access_token(subject="user123", extra_claims={"role": "admin"})
    payload = decode_token(token)
    assert payload["role"] == "admin"


def test_expired_access_token_raises() -> None:
    """Token with -1 second TTL should be rejected immediately."""
    token = create_access_token(
        subject="user123", expires_delta=timedelta(seconds=-1)
    )
    with pytest.raises(JWTError):
        decode_token(token)


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  JWT — refresh tokens                                                       ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

def test_create_and_decode_refresh_token() -> None:
    user_id = "507f1f77bcf86cd799439011"
    token = create_refresh_token(subject=user_id)
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"


def test_access_and_refresh_tokens_are_different() -> None:
    user_id = "507f1f77bcf86cd799439011"
    access = create_access_token(subject=user_id)
    refresh = create_refresh_token(subject=user_id)
    assert access != refresh


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  get_subject helper                                                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

def test_get_subject_valid_token() -> None:
    user_id = "507f1f77bcf86cd799439011"
    token = create_access_token(subject=user_id)
    assert get_subject(token) == user_id


def test_get_subject_invalid_token_returns_none() -> None:
    assert get_subject("this.is.garbage") is None


def test_get_subject_expired_returns_none() -> None:
    token = create_access_token(
        subject="user123", expires_delta=timedelta(seconds=-1)
    )
    assert get_subject(token) is None


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Token tampering                                                            ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

def test_tampered_token_signature_raises() -> None:
    token = create_access_token(subject="user123")
    # Flip the last character of the signature segment
    parts = token.split(".")
    parts[-1] = parts[-1][:-1] + ("A" if parts[-1][-1] != "A" else "B")
    tampered = ".".join(parts)
    with pytest.raises(JWTError):
        decode_token(tampered)
