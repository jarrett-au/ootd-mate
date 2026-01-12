/**
 * Auth-related types for OOTD Mate
 */

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

export interface AuthContext {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export interface LoginResponse {
  url: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface MeResponse {
  user: User;
  session: Session;
}
