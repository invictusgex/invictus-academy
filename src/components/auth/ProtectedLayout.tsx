"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminProvider } from "@/providers/AdminProvider";

export type ProtectedLayoutProps = {
  children: ReactNode;
};

// Flujo privado: AuthProvider -> RequireAuth -> Academy.
// La autorizacion por enrollment se resuelve server-side en las rutas academy.
export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <RequireAuth>
      <AdminProvider>
        {children}
      </AdminProvider>
    </RequireAuth>
  );
}
