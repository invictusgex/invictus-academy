"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";

export type ProtectedLayoutProps = {
  children: ReactNode;
};

// Flujo esperado para una fase futura:
//
// AuthProvider
//   ↓
// RequireAuth
//   ↓
// RequireEnrollment
//   ↓
// Academy
//
// En esta etapa solo aplica autenticacion. Enrollment se integrara despues.
export function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return <RequireAuth>{children}</RequireAuth>;
}
