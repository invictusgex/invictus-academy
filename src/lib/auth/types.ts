export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthSession {
  expiresAt: number | null;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
}

export type AuthStateChangeHandler = (state: AuthState) => void;

export type AuthUnsubscribe = () => void;
