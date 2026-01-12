/**
 * Authentication utility functions for Supabase OAuth
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SessionUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    full_name?: string;
  };
  created_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SessionUser;
}

/**
 * Initiate OAuth login flow
 */
export async function login(provider: string = 'google', redirectTo: string = '/') {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        provider,
        redirect_to: redirectTo,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Redirect to Supabase OAuth URL
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No authorization URL returned');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout user and clear cookies
 */
export async function logout() {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Redirect to login page after successful logout
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Get current user session
 */
export async function getSession(): Promise<{ user: SessionUser | null; authenticated: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { user: null, authenticated: false };
    }

    const data = await response.json();
    return {
      user: data.user,
      authenticated: data.authenticated || false,
    };
  } catch (error) {
    console.error('Get session error:', error);
    return { user: null, authenticated: false };
  }
}

/**
 * Get current user data (lighter than getSession)
 */
export async function getMe() {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get me error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.authenticated;
}

/**
 * Get user display name from user metadata
 */
export function getUserDisplayName(user: SessionUser): string {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'
  );
}

/**
 * Get user avatar URL from user metadata
 */
export function getUserAvatarUrl(user: SessionUser): string | undefined {
  return user.user_metadata?.avatar_url || user.user_metadata?.picture;
}
