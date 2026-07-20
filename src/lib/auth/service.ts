import type { Session, User } from "@supabase/supabase-js";

import { getAuthClient } from "@/lib/auth/client";
import type {
  AuthSession,
  AuthState,
  AuthStateChangeHandler,
  AuthUnsubscribe,
  AuthUser,
} from "@/lib/auth/types";
import { isSupabaseConfigured } from "@/lib/database/client";

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

function createAnonymousAuthState(): AuthState {
  return {
    user: null,
    session: null,
    isAuthenticated: false,
  };
}

// Obtiene el usuario autenticado actual sin conectar todavia este flujo a la UI.
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const authClient = getAuthClient();
  const { data, error } = await authClient.getUser();

  if (error) {
    throw error;
  }

  return mapUser(data.user);
}

// Obtiene la sesion actual desde Supabase Auth para uso futuro en servicios.
export async function getSession(): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return createAnonymousAuthState();
  }

  const authClient = getAuthClient();
  const { data, error } = await authClient.getSession();

  if (error) {
    throw error;
  }

  return createAuthState(data.session);
}

// Punto de entrada tecnico para login futuro; no se usa aun desde pantallas.
export async function signIn(input: SignInInput): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase Auth is not configured.");
  }

  const authClient = getAuthClient();
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
  if (!isSupabaseConfigured()) {
    return;
  }

  const authClient = getAuthClient();
  const { error } = await authClient.signOut();

  if (error) {
    throw error;
  }
}

// Solicita recuperacion de password sin crear todavia pantallas de recuperacion.
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase Auth is not configured.");
  }

  const authClient = getAuthClient();
  const { error } = await authClient.resetPasswordForEmail(input.email);

  if (error) {
    throw error;
  }
}

// Encapsula la suscripcion del proveedor para que React solo consuma AuthRepository.
export function onAuthStateChange(
  handler: AuthStateChangeHandler,
): AuthUnsubscribe {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const authClient = getAuthClient();
  const { data } = authClient.onAuthStateChange((_event, session) => {
    handler(createAuthState(session));
  });

  return () => {
    data.subscription.unsubscribe();
  };
}
