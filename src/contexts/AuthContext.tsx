"use client";

import { createContext } from "react";

import type { AuthSession, AuthUser } from "@/lib/auth/types";

export type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  initialized: boolean;
  authAction: "checkingAccess" | "signingIn" | "signingOut" | null;
  passwordRecovery: boolean;
  passwordRecoveryStatus: "checking" | "valid" | "invalid";
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (input: { password: string }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
