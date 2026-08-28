// Reusable mapping of low-level Prisma errors to safe API error responses.
//
// Raw Prisma errors must never reach clients: their messages embed internal
// details (query shapes, table names, connection strings fragments). This module
// converts known PrismaClientKnownRequestError codes into stable, user-safe
// messages and HTTP statuses, and provides a single entry point for API route
// catch blocks.

/** Minimal shape of a Prisma request error we care about (P20xx codes). */
function getErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return null;
}

export interface ApiErrorInfo {
  /** Safe, user-facing message. Never contains internal Prisma details. */
  message: string;
  /** HTTP status to respond with. */
  status: number;
}

/**
 * Map a known Prisma request error to a safe message + status.
 * Returns null when the error is not a recognized Prisma request error,
 * letting callers fall back to their own handling.
 *
 * @param entityLabel Human-readable entity name, e.g. "Project".
 */
export function describePrismaError(
  error: unknown,
  entityLabel: string,
): ApiErrorInfo | null {
  const code = getErrorCode(error);
  switch (code) {
    // Unique constraint violation (e.g. duplicate slug/email).
    case "P2002":
      return {
        message: `${entityLabel} with the same value already exists`,
        status: 409,
      };
    // Record not found / required relation missing.
    case "P2025":
      return { message: `${entityLabel} not found`, status: 404 };
    // Foreign key constraint violation.
    case "P2003":
      return {
        message: `${entityLabel} is referenced by other records`,
        status: 409,
      };
    default:
      return null;
  }
}

/**
 * Single handler for API route catch blocks. Recognizes the app's own
 * auth guard ("Unauthorized"), maps Prisma error codes to friendly
 * responses, and degrades everything else to a generic 500 without
 * leaking internals.
 *
 * @param entityLabel Human-readable entity name used in Prisma-derived
 * messages, e.g. "Project".
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "Internal Server Error",
  entityLabel = "Record",
): ApiErrorInfo {
  if (error instanceof Error && error.message === "Unauthorized") {
    return { message: "Unauthorized", status: 401 };
  }

  const described = describePrismaError(error, entityLabel);
  if (described) return described;

  return { message: fallbackMessage, status: 500 };
}
