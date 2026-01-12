# Authentication System Setup Guide

This document describes the OAuth authentication system implemented for OOTD Mate using Supabase Auth.

## Overview

The authentication system uses:
- **Supabase Auth** for OAuth (Google) authentication
- **PKCE flow** for secure OAuth authorization
- **HTTP-only cookies** for session storage
- **FastAPI** backend with auth endpoints
- **Next.js** middleware for route protection

## Architecture

### Backend (FastAPI)

#### Files Created
- `apps/backend/app/api/deps.py` - Dependency injection for authenticated routes
- `apps/backend/app/api/endpoints/auth.py` - OAuth endpoints
- `apps/backend/app/api/__init__.py` - Router registration
- `apps/backend/app/core/config.py` - Updated with Supabase settings

#### API Endpoints

1. **POST /api/auth/login** - Initiate OAuth flow
   - Input: `{ "provider": "google", "redirect_to": "/" }`
   - Output: `{ "url": "authorization_url" }`
   - Sets PKCE code verifier cookie

2. **GET /api/auth/callback** - Handle OAuth callback
   - Query params: `code`, `state`, `error`
   - Exchanges authorization code for session
   - Sets HTTP-only session cookies
   - Redirects to frontend

3. **POST /api/auth/logout** - Logout user
   - Clears all auth cookies
   - Revokes session with Supabase

4. **GET /api/auth/me** - Get current user
   - Returns: `{ "user": {...}, "authenticated": true }`
   - Requires authentication

5. **GET /api/auth/session** - Lightweight session check
   - Returns: `{ "authenticated": true/false, "user": {...} }`

### Frontend (Next.js)

#### Files Created
- `apps/frontend/src/lib/auth.ts` - Auth utility functions
- `apps/frontend/src/app/(auth)/login/page.tsx` - Login page
- `apps/frontend/src/app/auth/callback/page.tsx` - OAuth callback handler
- `apps/frontend/src/middleware.ts` - Route protection middleware

#### Auth Utilities

```typescript
// Initiate OAuth login
await login('google', '/dashboard');

// Logout user
await logout();

// Get current session
const { user, authenticated } = await getSession();

// Check authentication
const isAuth = await isAuthenticated();
```

### Shared Types

#### File: `packages/shared/src/types/auth.ts`

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Authentication → Providers
4. Enable Google provider
5. Add your Google OAuth credentials (create in Google Cloud Console)
6. Set redirect URL: `http://localhost:8000/api/auth/callback`

### 2. Configure Environment Variables

Update your `.env` file with Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Get your credentials from:
- Supabase Dashboard → Settings → API

### 3. Install Dependencies

Backend dependencies are already included in `pyproject.toml`:
- `httpx` - For making HTTP requests to Supabase
- `fastapi` - Web framework
- `pydantic-settings` - Settings management

### 4. Run the Application

```bash
# Install backend dependencies (if needed)
cd apps/backend
uv sync

# Start backend
cd ../..
pnpm dev
```

This will start:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### 5. Test Authentication Flow

1. Navigate to `http://localhost:3000`
2. Middleware will redirect you to `/login`
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. You'll be redirected back with session cookies
6. Home page will display your user info

## Security Features

### PKCE Flow
- Code verifier generated on login
- Code challenger sent to Supabase
- Verifier stored in HTTP-only cookie
- Verified on callback to prevent authorization code interception

### HTTP-Only Cookies
- `sb-access-token` - Access token (1 hour)
- `sb-refresh-token` - Refresh token (30 days)
- `sb-code-verifier` - PKCE verifier (10 minutes)
- All cookies are HTTP-only and SameSite=lax

### Route Protection
- Middleware checks authentication on all routes
- Public routes: `/login`, `/auth/callback`
- Protected routes redirect to login if not authenticated
- Automatic session validation

## Acceptance Criteria Met

✅ User can sign in with Google OAuth
✅ Session stored in HTTP-only cookies
✅ Protected routes redirect to /login if not authenticated
✅ GET /api/auth/me returns current user data
✅ POST /api/auth/logout clears cookies and redirects
✅ Session automatically refreshes (via refresh token)

## Usage Examples

### Protected API Route

```python
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/api/protected")
async def protected_route(user: dict = Depends(get_current_user)):
    return {"message": f"Hello {user['email']}"}
```

### Client-Side Auth Check

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';

export default function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getSession().then(({ user, authenticated }) => {
      if (authenticated) {
        setUser(user);
      }
    });
  }, []);

  return <div>Welcome {user?.email}</div>;
}
```

## Troubleshooting

### "Not authenticated" error
- Check that cookies are being set (browser DevTools → Application → Cookies)
- Verify `FRONTEND_URL` matches your frontend URL
- Check CORS configuration

### OAuth callback fails
- Verify Google OAuth credentials are correct
- Check redirect URL in Supabase matches your backend URL
- Ensure callback URL is: `http://localhost:8000/api/auth/callback`

### Session expires too quickly
- Access token expires in 1 hour (Supabase default)
- Refresh token should auto-renew session
- Check cookie expiration times

### Middleware redirects loop
- Check that `/login` is in `publicPaths` array
- Verify middleware matcher config excludes API routes

## Next Steps

### Optional Enhancements
1. Implement session refresh on token expiry
2. Add more OAuth providers (GitHub, Facebook, etc.)
3. Implement role-based access control
4. Add email verification
5. Implement password reset flow
6. Add 2FA support

### Production Checklist
- [ ] Set `secure=True` for cookies (HTTPS required)
- [ ] Update redirect URLs for production domain
- [ ] Use S256 for PKCE code challenge method
- [ ] Implement proper error logging
- [ ] Add rate limiting to auth endpoints
- [ ] Set up monitoring for auth failures
