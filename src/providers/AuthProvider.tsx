"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";
import type { AuthSession, AuthUser } from "@/lib/auth/types";
import { AuthRepository } from "@/lib/repositories/auth.repository";

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

  useEffect(() => {
    let isMounted = true;

    function updateAuthState(nextSession: AuthSession | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
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
        }
      }
    }

    // Primero cargamos la sesion persistida; despues escuchamos cambios futuros
    // como login, logout o refresh de token cuando existan pantallas que los usen.
    const unsubscribe = AuthRepository.onAuthStateChange((authState) => {
      updateAuthState(authState.session);
      setLoading(false);
      setInitialized(true);
    });

    void loadInitialSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function signIn(input: SignInInput) {
    setLoading(true);

    try {
      const authState = await AuthRepository.signIn(input);
      setSession(authState.session);
      setUser(authState.user);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function signOut() {
    setLoading(true);

    try {
      await AuthRepository.signOut();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      initialized,
      signIn,
      signOut,
    }),
    [initialized, loading, session, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
