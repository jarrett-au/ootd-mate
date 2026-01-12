"""
Dependency injection for authenticated routes
"""
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Request
from app.core.config import settings


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Get the current authenticated user from the session cookie.

    Args:
        request: FastAPI request object
        authorization: Optional Authorization header

    Returns:
        User data dict

    Raises:
        HTTPException: If user is not authenticated
    """
    # Try to get session from cookies
    session_token = request.cookies.get("sb-access-token")

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Verify session with Supabase
    import httpx

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {session_token}",
                    "apikey": settings.supabase_anon_key
                },
                timeout=10.0
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired session"
                )

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )


async def optional_auth(
    request: Request
) -> Optional[Dict[str, Any]]:
    """
    Optional authentication dependency.

    Args:
        request: FastAPI request object

    Returns:
        User data dict if authenticated, None otherwise
    """
    try:
        return await get_current_user(request)
    except HTTPException:
        return None
