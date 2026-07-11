"""
app/core/exceptions.py
───────────────────────
Centralised custom exception classes and FastAPI exception handlers.
Register handlers with `register_exception_handlers(app)` in main.py.
"""

import logging
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


# ── Custom exception classes ───────────────────────────────────────────────────

class SocialPulseError(Exception):
    """Base exception for all application-level errors."""

    def __init__(self, detail: str, status_code: int = 500) -> None:
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class NotFoundError(SocialPulseError):
    def __init__(self, resource: str, resource_id: str = "") -> None:
        msg = f"{resource} not found" + (f": {resource_id}" if resource_id else "")
        super().__init__(detail=msg, status_code=404)


class ConflictError(SocialPulseError):
    def __init__(self, detail: str) -> None:
        super().__init__(detail=detail, status_code=409)


class ForbiddenError(SocialPulseError):
    def __init__(self, detail: str = "Access denied.") -> None:
        super().__init__(detail=detail, status_code=403)


# ── Exception handlers ─────────────────────────────────────────────────────────

def _error_body(detail: Any, status_code: int) -> Dict[str, Any]:
    return {"detail": detail, "status_code": status_code}


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all exception handlers to the FastAPI application instance."""

    @app.exception_handler(SocialPulseError)
    async def socialpulse_error_handler(
        request: Request, exc: SocialPulseError
    ) -> JSONResponse:
        logger.warning(
            "Application error: %s %s → %s",
            request.method, request.url.path, exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.detail, exc.status_code),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        logger.info(
            "HTTP %s: %s %s", exc.status_code, request.method, request.url.path
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.detail, exc.status_code),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Flatten pydantic v2 error list into something friendlier
        errors = [
            {
                "field": " → ".join(str(loc) for loc in err["loc"] if loc != "body"),
                "message": err["msg"],
            }
            for err in exc.errors()
        ]
        logger.debug("Validation error on %s: %s", request.url.path, errors)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": errors, "status_code": 422},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(
            "Unhandled exception on %s %s", request.method, request.url.path
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                "An unexpected error occurred. Please try again later.", 500
            ),
        )
