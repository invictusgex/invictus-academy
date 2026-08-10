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

type PasswordRecoveryStatus = "checking" | "valid" | "invalid";

function hasPasswordRecoveryUrlSignal() {
  if (typeof window === "undefined") {
    return false;
  }

  const hashParams = new URLSearchParams(window.location.hash.slice(1));

  return hashParams.get("type") === "recovery";
}

// El provider coordina el estado global de auth sin conocer Supabase.
// Toda lectura de sesion y suscripcion pasa por AuthRepository.
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [passwordRecoveryStatus, setPasswordRecoveryStatus] =
    useState<PasswordRecoveryStatus>("checking");
  const [authAction, setAuthAction] = useState<
    "checkingAccess" | "signingIn" | "signingOut" | null
  >("checkingAccess");

  useEffect(() => {
    let isMounted = true;
    let profileRequestId = 0;
    let recoveryFallbackTimeout: ReturnType<typeof setTimeout> | null = null;
    const startedFromPasswordRecovery = hasPasswordRecoveryUrlSignal();

    function scheduleRecoveryFallback() {
      if (!startedFromPasswordRecovery || recoveryFallbackTimeout) {
        return;
      }

      recoveryFallbackTimeout = setTimeout(() => {
        if (!isMounted) {
          return;
        }

        setPasswordRecoveryStatus((currentStatus) =>
          currentStatus === "valid" ? "valid" : "invalid",
        );
      }, 2500);
    }

    function clearRecoveryFallback() {
      if (!recoveryFallbackTimeout) {
        return;
      }

      clearTimeout(recoveryFallbackTimeout);
      recoveryFallbackTimeout = null;
    }

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

        if (startedFromPasswordRecovery && authState.session) {
          setPasswordRecoveryStatus("valid");
          clearRecoveryFallback();
        } else if (startedFromPasswordRecovery) {
          setPasswordRecoveryStatus("checking");
          scheduleRecoveryFallback();
        } else {
          setPasswordRecoveryStatus("invalid");
        }
      } catch {
        updateAuthState(null);
        setPasswordRecoveryStatus(
          startedFromPasswordRecovery ? "checking" : "invalid",
        );

        if (startedFromPasswordRecovery) {
          scheduleRecoveryFallback();
        }
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
    const unsubscribe = AuthRepository.onAuthStateChange((authState, event) => {
      updateAuthState(authState.session);

      if (event === "passwordRecovery") {
        setPasswordRecoveryStatus("valid");
        clearRecoveryFallback();
      } else if (startedFromPasswordRecovery && authState.session) {
        setPasswordRecoveryStatus("valid");
        clearRecoveryFallback();
      } else if (!startedFromPasswordRecovery || event === "signedOut") {
        setPasswordRecoveryStatus("invalid");
      }

      setLoading(false);
      setInitialized(true);
      setAuthAction(null);
    });

    void loadInitialSession();

    return () => {
      isMounted = false;
      clearRecoveryFallback();
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
      setPasswordRecoveryStatus("invalid");
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
      setPasswordRecoveryStatus("invalid");
    } finally {
      setLoading(false);
      setInitialized(true);
      setAuthAction(null);
    }
  }

  async function updatePassword(input: { password: string }) {
    setLoading(true);

    try {
      await AuthRepository.updatePassword(input);
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
      authAction,
      passwordRecovery: passwordRecoveryStatus === "valid",
      passwordRecoveryStatus,
      signIn,
      signOut,
      updatePassword,
    }),
    [authAction, initialized, loading, passwordRecoveryStatus, session, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
