'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getSession, logout, getUserDisplayName } from '@/lib/auth';
import { useEffect, useState } from 'react';
import type { SessionUser } from '@/lib/auth';

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await getSession();
        setUser(session.user);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">OOTD Mate</h1>

          {!isLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName(user)} />
                    <AvatarFallback>{getInitials(getUserDisplayName(user))}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName(user)}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome{user ? `, ${getUserDisplayName(user)}` : ''}!
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Your AI-powered outfit assistant is ready to help you look your best.
          </p>
          {!isLoading && user && (
            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">You're signed in!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your account: {user.email}
              </p>
              <div className="text-xs text-muted-foreground">
                User ID: {user.id}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
