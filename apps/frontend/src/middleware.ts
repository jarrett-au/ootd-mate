import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/auth/callback'];

// Paths that should redirect to dashboard if authenticated
const authPaths = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication check
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // If user is already authenticated and tries to access auth pages, redirect to home
    if (authPaths.some(path => pathname.startsWith(path))) {
      const accessToken = request.cookies.get('sb-access-token')?.value;

      if (accessToken) {
        // Verify token is valid by checking session
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/auth/session`, {
            headers: {
              'Cookie': `sb-access-token=${accessToken}`,
            },
            cache: 'no-store',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              // User is authenticated, redirect to home
              const url = request.nextUrl.clone();
              url.pathname = '/';
              return NextResponse.redirect(url);
            }
          }
        } catch (error) {
          // If session check fails, continue to login page
          console.error('Session check failed:', error);
        }
      }
    }

    return NextResponse.next();
  }

  // For protected routes, check authentication
  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    // No access token found, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verify the token is still valid
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/auth/session`, {
      headers: {
        'Cookie': `sb-access-token=${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Token is invalid or expired, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const data = await response.json();
    if (!data.authenticated) {
      // Token is invalid or expired, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Token is valid, proceed to the protected route
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    // On error, redirect to login to be safe
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
