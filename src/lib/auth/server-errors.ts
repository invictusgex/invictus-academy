export const SERVER_AUTH_ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  SESSION_REPLACED: "SESSION_REPLACED",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  AUTH_PROVIDER_ERROR: "AUTH_PROVIDER_ERROR",
} as const;

export type ServerAuthErrorCode =
  (typeof SERVER_AUTH_ERROR_CODES)[keyof typeof SERVER_AUTH_ERROR_CODES];

export class ServerAuthError extends Error {
  readonly code: ServerAuthErrorCode;
  readonly status: number;
  override readonly cause?: unknown;

  constructor(
    code: ServerAuthErrorCode,
    message: string,
    options?: {
      status?: number;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "ServerAuthError";
    this.code = code;
    this.status = options?.status ?? 500;
    this.cause = options?.cause;
  }
}
