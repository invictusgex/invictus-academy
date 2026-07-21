"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireEnrollment } from "@/components/auth/RequireEnrollment";
import { AdminProvider } from "@/providers/AdminProvider";
import { ProgressProvider } from "@/providers/ProgressProvider";
import type { Course } from "@/types/academy";

export type ProtectedLayoutProps = {
  children: ReactNode;
  course: Course;
};

const academyProductSlug = "trading-basado-en-datos";

// Flujo privado: AuthProvider -> RequireAuth -> RequireEnrollment -> Academy.
// La proteccion de enrollment vive en /academy, no en rutas publicas.
export function ProtectedLayout({
  children,
  course,
}: ProtectedLayoutProps) {
  return (
    <RequireAuth>
      <AdminProvider>
        <RequireEnrollment productSlug={academyProductSlug}>
          <ProgressProvider
            course={course}
            productSlug={academyProductSlug}
            programId={course.id}
          >
            {children}
          </ProgressProvider>
        </RequireEnrollment>
      </AdminProvider>
    </RequireAuth>
  );
}
