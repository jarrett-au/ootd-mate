'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setStatus('error');
        setError(errorDescription || errorParam);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      // The callback is actually handled by the backend
      // The backend will set cookies and redirect
      // This page is just a fallback in case the redirect doesn't work
      try {
        // Forward to backend callback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const redirectUrl = `${apiUrl}/api/auth/callback?code=${code}`;

        // The backend will handle the token exchange and set cookies
        // We'll receive a redirect back to the frontend
        window.location.href = redirectUrl;
      } catch (err) {
        setStatus('error');
        setError('Failed to complete authentication');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8">
        {status === 'loading' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Completing sign in...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Successfully signed in!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to the app...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sign in failed
            </h2>
            {error && (
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you back to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
