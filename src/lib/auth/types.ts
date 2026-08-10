export interface AuthUser {
  id: string;
  email: string | null;
  fullName?: string | null;
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

export type AuthEvent =
  | "initialSession"
  | "signedIn"
  | "signedOut"
  | "tokenRefreshed"
  | "userUpdated"
  | "unknown";

export type AuthStateChangeHandler = (
  state: AuthState,
  event: AuthEvent,
) => void;

export type AuthUnsubscribe = () => void;
