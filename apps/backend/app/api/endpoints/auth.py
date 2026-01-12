"""
OAuth authentication endpoints using Supabase Auth
"""
import httpx
from fastapi import APIRouter, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from app.core.config import settings
from app.api.deps import get_current_user
from typing import Dict, Any
import secrets

router = APIRouter()


class LoginRequest(BaseModel):
    provider: str = "google"
    redirect_to: str = "/"


class CallbackRequest(BaseModel):
    code: str
    state: str


@router.post("/login")
async def login(request: Request, body: LoginRequest) -> Dict[str, str]:
    """
    Initiate OAuth login flow with PKCE.

    Args:
        request: FastAPI request object
        body: Login request with provider and redirect URL

    Returns:
        Dictionary with authorization URL
    """
    if body.provider != "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Google OAuth is currently supported"
        )

    # Generate PKCE code verifier and code challenge
    code_verifier = secrets.token_urlsafe(32)
    code_challenge = code_verifier  # In production, hash this with SHA256

    # Store code_verifier in session/cookie for callback verification
    # For simplicity, we'll use a cookie
    redirect_response = Response()

    # Create callback URL
    frontend_url = settings.frontend_url.rstrip("/")
    callback_url = f"{frontend_url}/auth/callback"

    # Build Supabase OAuth URL
    supabase_url = settings.supabase_url.rstrip("/")
    auth_url = (
        f"{supabase_url}/auth/v1/authorize"
        f"?provider={body.provider}"
        f"&redirect_to={callback_url}"
        f"&code_challenge={code_challenge}"
        f"&code_challenge_method=plain"  # Use S256 in production
    )

    # Store code verifier in HTTP-only cookie
    redirect_response.set_cookie(
        key="sb-code-verifier",
        value=code_verifier,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=600  # 10 minutes
    )

    redirect_response.set_cookie(
        key="sb-redirect-to",
        value=body.redirect_to,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600
    )

    import json
    redirect_response.content = json.dumps({"url": auth_url})
    redirect_response.media_type = "application/json"

    return redirect_response


@router.get("/callback")
async def callback_oauth_get(
    request: Request,
    code: str,
    state: str = None,
    error: str = None,
    error_description: str = None
) -> RedirectResponse:
    """
    Handle OAuth callback via GET (Supabase redirects here).

    Args:
        request: FastAPI request object
        code: Authorization code from OAuth provider
        state: State parameter for CSRF protection
        error: Error code if authentication failed
        error_description: Error description

    Returns:
        Redirect response to frontend
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {error_description or error}"
        )

    # Get code verifier from cookie
    code_verifier = request.cookies.get("sb-code-verifier")
    redirect_to = request.cookies.get("sb-redirect-to", "/")

    if not code_verifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing code verifier. Please try login again."
        )

    # Exchange code for session with Supabase
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.supabase_url}/auth/v1/token?grant_type=pkce",
                headers={
                    "apikey": settings.supabase_anon_key,
                    "Content-Type": "application/json"
                },
                json={
                    "auth_code": code,
                    "code_verifier": code_verifier
                },
                timeout=10.0
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to exchange code for session"
                )

            session_data = response.json()

            # Create redirect response with session cookies
            frontend_url = settings.frontend_url.rstrip("/")
            redirect_response = RedirectResponse(
                url=f"{frontend_url}{redirect_to}",
                status_code=302
            )

            # Set HTTP-only cookies for session
            redirect_response.set_cookie(
                key="sb-access-token",
                value=session_data.get("access_token", ""),
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite="lax",
                max_age=3600  # 1 hour
            )

            redirect_response.set_cookie(
                key="sb-refresh-token",
                value=session_data.get("refresh_token", ""),
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=2592000  # 30 days
            )

            # Clear temporary cookies
            redirect_response.delete_cookie("sb-code-verifier")
            redirect_response.delete_cookie("sb-redirect-to")

            return redirect_response

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )


@router.post("/logout")
async def logout(request: Request) -> Dict[str, str]:
    """
    Logout user by clearing cookies.

    Args:
        request: FastAPI request object

    Returns:
        Success message
    """
    # Get refresh token if available
    refresh_token = request.cookies.get("sb-refresh-token")

    # Revoke session with Supabase if refresh token exists
    if refresh_token:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{settings.supabase_url}/auth/v1/logout",
                    headers={
                        "apikey": settings.supabase_anon_key,
                        "Authorization": f"Bearer {refresh_token}"
                    },
                    timeout=10.0
                )
        except Exception:
            pass  # Continue even if revocation fails

    # Create response that clears cookies
    response_data = {"message": "Logged out successfully"}

    # Create Response object to manage cookies
    response = Response(content=response_data, media_type="application/json")

    # Clear all auth cookies
    response.delete_cookie("sb-access-token", path="/")
    response.delete_cookie("sb-refresh-token", path="/")
    response.delete_cookie("sb-code-verifier", path="/")
    response.delete_cookie("sb-redirect-to", path="/")

    return response


@router.get("/me")
async def get_me(user: Dict[str, Any] = get_current_user) -> Dict[str, Any]:
    """
    Get current authenticated user data.

    Args:
        user: Current user from dependency

    Returns:
        User data and session info
    """
    return {
        "user": user,
        "authenticated": True
    }


@router.get("/session")
async def get_session(request: Request) -> Dict[str, Any]:
    """
    Get current session info (lightweight check).

    Args:
        request: FastAPI request object

    Returns:
        Session status
    """
    access_token = request.cookies.get("sb-access-token")

    if not access_token:
        return {"authenticated": False, "user": None}

    # Verify session with Supabase
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "apikey": settings.supabase_anon_key
                },
                timeout=10.0
            )

            if response.status_code == 200:
                user = response.json()
                return {
                    "authenticated": True,
                    "user": user
                }
            else:
                return {"authenticated": False, "user": None}

    except Exception:
        return {"authenticated": False, "user": None}
