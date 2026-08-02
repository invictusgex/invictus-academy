import "server-only";

import type { AuthError, User } from "@supabase/supabase-js";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { ProfileRepository, type Profile } from "@/lib/repositories/profile.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ServerAuthUser = {
  id: string;
  email: string | null;
};

export type ServerAuthContext = {
  user: ServerAuthUser;
  profile: Profile;
};

function mapServerUser(user: User): ServerAuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

function isMissingSessionError(error: AuthError) {
  return (
    error.name === "AuthSessionMissingError" ||
    error.message.toLowerCase().includes("auth session missing")
  );
}

function mapAuthError(error: AuthError): ServerAuthError {
  if (isMissingSessionError(error)) {
    return new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED,
      "No existe una sesión autenticada.",
      {
        status: 401,
        cause: error,
      },
    );
  }

  return new ServerAuthError(
    SERVER_AUTH_ERROR_CODES.AUTH_PROVIDER_ERROR,
    "No se pudo validar la sesión con el proveedor de autenticación.",
    {
      status: 502,
      cause: error,
    },
  );
}

export async function getCurrentServerUser(): Promise<ServerAuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    throw mapAuthError(error);
  }

  return data.user ? mapServerUser(data.user) : null;
}

export async function requireServerUser(): Promise<ServerAuthUser> {
  const user = await getCurrentServerUser();

  if (!user) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED,
      "No existe una sesión autenticada.",
      {
        status: 401,
      },
    );
  }

  return user;
}

export async function requireServerAuthContext(): Promise<ServerAuthContext> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw mapAuthError(error);
  }

  if (!data.user) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED,
      "No existe una sesión autenticada.",
      {
        status: 401,
      },
    );
  }

  let profile: Profile | null = null;

  try {
    profile = await ProfileRepository.getById(supabase, data.user.id);
  } catch (error) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.AUTH_PROVIDER_ERROR,
      "No se pudo resolver el perfil del usuario autenticado.",
      {
        status: 502,
        cause: error,
      },
    );
  }

  if (!profile) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
      "No existe un perfil asociado al usuario autenticado.",
      {
        status: 404,
      },
    );
  }

  return {
    user: mapServerUser(data.user),
    profile,
  };
}
