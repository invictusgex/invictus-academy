"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireEnrollment } from "@/components/auth/RequireEnrollment";
import { getAcademyProgram } from "@/lib/academy";
import { ProgressProvider } from "@/providers/ProgressProvider";

export type ProtectedLayoutProps = {
  children: ReactNode;
};

const academyProductSlug = "trading-basado-en-datos";
const academyProgram = getAcademyProgram();

// Flujo privado: AuthProvider -> RequireAuth -> RequireEnrollment -> Academy.
// La proteccion de enrollment vive en /academy, no en rutas publicas.
export function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <RequireAuth>
      <RequireEnrollment productSlug={academyProductSlug}>
        <ProgressProvider
          course={academyProgram}
          productSlug={academyProductSlug}
          programId={academyProgram.id}
        >
          {children}
        </ProgressProvider>
      </RequireEnrollment>
    </RequireAuth>
  );
}
