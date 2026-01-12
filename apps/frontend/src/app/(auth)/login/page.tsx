'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/session`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.authenticated) {
          // User is already logged in, redirect to home
          router.push('/');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await login('google', '/');
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M20.38 3.4a2 2 0 0 0-2-2h-12.76a2 2 0 0 0-2 2l-.15 14.7a2 2 0 0 0 1.77 2.1l2.63.3a2 2 0 0 1 1.77 1.9l.31 2.6a2 2 0 0 0 2 1.8h8.48a2 2 0 0 0 2-2z" />
              <path d="M9 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to OOTD Mate</CardTitle>
          <CardDescription className="text-base">
            Sign in to start managing your outfits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
            <p className="mb-2">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
            <p className="text-xs">
              Your account is secure and we'll never post to your Google account without your permission.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
