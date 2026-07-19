import type { Session, User } from "@supabase/supabase-js";

import { authClient } from "@/lib/auth/client";
import type { AuthSession, AuthState, AuthUser } from "@/lib/auth/types";

type SignInInput = {
  email: string;
  password: string;
};

type ResetPasswordInput = {
  email: string;
};

function mapUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

function mapSession(session: Session | null): AuthSession | null {
  if (!session) {
    return null;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    user: mapUser(session.user) as AuthUser,
  };
}

function createAuthState(session: Session | null): AuthState {
  const mappedSession = mapSession(session);

  return {
    user: mappedSession?.user ?? null,
    session: mappedSession,
    isAuthenticated: Boolean(mappedSession?.user),
  };
}

// Obtiene el usuario autenticado actual sin conectar todavia este flujo a la UI.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await authClient.getUser();

  if (error) {
    throw error;
  }

  return mapUser(data.user);
}

// Obtiene la sesion actual desde Supabase Auth para uso futuro en servicios.
export async function getSession(): Promise<AuthState> {
  const { data, error } = await authClient.getSession();

  if (error) {
    throw error;
  }

  return createAuthState(data.session);
}

// Punto de entrada tecnico para login futuro; no se usa aun desde pantallas.
export async function signIn(input: SignInInput): Promise<AuthState> {
  const { data, error } = await authClient.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw error;
  }

  return createAuthState(data.session);
}

// Cierra la sesion actual cuando exista una UI futura que lo invoque.
export async function signOut(): Promise<void> {
  const { error } = await authClient.signOut();

  if (error) {
    throw error;
  }
}

// Solicita recuperacion de password sin crear todavia pantallas de recuperacion.
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const { error } = await authClient.resetPasswordForEmail(input.email);

  if (error) {
    throw error;
  }
}
