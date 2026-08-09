"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";
import type { AuthSession, AuthUser } from "@/lib/auth/types";
import { getSupabaseClient } from "@/lib/database/client";
import { AuthRepository } from "@/lib/repositories/auth.repository";
import { ProfileRepository } from "@/lib/repositories/profile.repository";

type AuthProviderProps = {
  children: React.ReactNode;
};

type SignInInput = {
  email: string;
  password: string;
};

// El provider coordina el estado global de auth sin conocer Supabase.
// Toda lectura de sesion y suscripcion pasa por AuthRepository.
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authAction, setAuthAction] = useState<
    "checkingAccess" | "signingIn" | "signingOut" | null
  >("checkingAccess");

  useEffect(() => {
    let isMounted = true;
    let profileRequestId = 0;

    function updateAuthState(nextSession: AuthSession | null) {
      if (!isMounted) {
        return;
      }

      const requestId = profileRequestId + 1;

      profileRequestId = requestId;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        return;
      }

      void ProfileRepository.getById(getSupabaseClient(), nextSession.user.id)
        .then((profile) => {
          if (!isMounted || requestId !== profileRequestId || !profile) {
            return;
          }

          setUser((currentUser) =>
            currentUser?.id === nextSession.user.id
              ? {
                  ...currentUser,
                  email: profile.email ?? currentUser.email,
                  fullName: profile.fullName ?? currentUser.fullName ?? null,
                }
              : currentUser,
          );
        })
        .catch(() => undefined);
    }

    async function loadInitialSession() {
      try {
        const authState = await AuthRepository.getSession();
        updateAuthState(authState.session);
      } catch {
        updateAuthState(null);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          setAuthAction(null);
        }
      }
    }

    // Primero cargamos la sesion persistida; despues escuchamos cambios futuros
    // como login, logout o refresh de token cuando existan pantallas que los usen.
    const unsubscribe = AuthRepository.onAuthStateChange((authState) => {
      updateAuthState(authState.session);
      setLoading(false);
      setInitialized(true);
      setAuthAction(null);
    });

    void loadInitialSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function signIn(input: SignInInput) {
    setLoading(true);
    setAuthAction("signingIn");

    try {
      const authState = await AuthRepository.signIn(input);
      setSession(authState.session);
      setUser(authState.user);
    } finally {
      setLoading(false);
      setInitialized(true);
      setAuthAction(null);
    }
  }

  async function signOut() {
    setLoading(true);
    setAuthAction("signingOut");

    try {
      await AuthRepository.signOut();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
      setAuthAction(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      initialized,
      authAction,
      signIn,
      signOut,
    }),
    [authAction, initialized, loading, session, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
