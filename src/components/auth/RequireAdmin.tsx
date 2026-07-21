"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAdminContext } from "@/contexts/AdminContext";

type RequireAdminProps = {
  children: ReactNode;
};

function AdminLoadingFallback() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-5 text-center">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Verificando acceso administrativo...
        </p>
      </div>
    </main>
  );
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const router = useRouter();
  const { isAdmin, loading } = useAdminContext();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/academy");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <AdminLoadingFallback />;
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}
