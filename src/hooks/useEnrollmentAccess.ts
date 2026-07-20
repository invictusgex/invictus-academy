"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getProgramAccess } from "@/lib/services/enrollment.service";
import type {
  Enrollment,
  EnrollmentAccessReason,
  EnrollmentAccessResult,
} from "@/lib/types/enrollment.types";

type UseEnrollmentAccessInput = {
  profileId: string | null;
  productSlug: string;
};

type UseEnrollmentAccessState = {
  enrollment: Enrollment | null;
  error: Error | null;
  hasAccess: boolean;
  loading: boolean;
  reason: EnrollmentAccessReason | null;
  retry: () => void;
};

const defaultAccessResult: EnrollmentAccessResult = {
  hasAccess: false,
  enrollment: null,
  reason: "not_found",
};

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error("No pudimos verificar el acceso al programa.");
}

// El hook evita que componentes React conozcan Supabase o repositorios.
// Tambien descarta respuestas antiguas si cambia el usuario o el producto.
export function useEnrollmentAccess({
  profileId,
  productSlug,
}: UseEnrollmentAccessInput): UseEnrollmentAccessState {
  const [result, setResult] =
    useState<EnrollmentAccessResult>(defaultAccessResult);
  const [loading, setLoading] = useState(Boolean(profileId));
  const [error, setError] = useState<Error | null>(null);
  const requestSequence = useRef(0);

  const loadAccess = useCallback(async () => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;

    if (!profileId) {
      setResult(defaultAccessResult);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(defaultAccessResult);

    try {
      const nextResult = await getProgramAccess({
        productSlug,
        userId: profileId,
      });

      if (requestSequence.current !== requestId) {
        return;
      }

      setResult(nextResult);
    } catch (caughtError) {
      if (requestSequence.current !== requestId) {
        return;
      }

      setResult(defaultAccessResult);
      setError(toError(caughtError));
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [productSlug, profileId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAccess();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestSequence.current += 1;
    };
  }, [loadAccess]);

  return {
    enrollment: result.enrollment,
    error,
    hasAccess: result.hasAccess,
    loading,
    reason: result.reason,
    retry: loadAccess,
  };
}
