"use client";

import type { ReactNode } from "react";

export type RequireEnrollmentState = "hasProgramAccess" | "noAccess";

export type RequireEnrollmentProps = {
  children: ReactNode;
  hasProgramAccess: boolean;
  noAccessFallback?: ReactNode;
};

// RequireEnrollment representa el segundo filtro: autorizacion por inscripcion.
// No consulta EnrollmentRepository todavia; recibe el estado calculado por props.
export function RequireEnrollment({
  children,
  hasProgramAccess,
  noAccessFallback = null,
}: RequireEnrollmentProps) {
  const state: RequireEnrollmentState = hasProgramAccess
    ? "hasProgramAccess"
    : "noAccess";

  if (state === "noAccess") {
    return noAccessFallback;
  }

  return children;
}
