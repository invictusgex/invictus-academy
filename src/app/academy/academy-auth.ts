import "server-only";

import { redirect } from "next/navigation";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import {
  requireServerAuthContext,
  type ServerAuthContext,
} from "@/lib/auth/server";

export async function requireAcademyAuthContext(): Promise<ServerAuthContext> {
  try {
    return await requireServerAuthContext();
  } catch (error) {
    if (
      error instanceof ServerAuthError &&
      error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED
    ) {
      redirect("/login");
    }

    throw error;
  }
}
