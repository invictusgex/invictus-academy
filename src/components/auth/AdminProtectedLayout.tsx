"use client";

import type { ReactNode } from "react";

import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminProvider } from "@/providers/AdminProvider";

type AdminProtectedLayoutProps = {
  children: ReactNode;
};

export function AdminProtectedLayout({ children }: AdminProtectedLayoutProps) {
  return (
    <RequireAuth>
      <AdminProvider>
        <RequireAdmin>{children}</RequireAdmin>
      </AdminProvider>
    </RequireAuth>
  );
}
