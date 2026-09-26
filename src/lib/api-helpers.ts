import { NextResponse } from "next/server";
import type { PaginationMeta } from "@/types/api";
import { handleApiError } from "@/lib/prisma-errors";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: string, status = 400, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers });
}

/**
 * Convert a thrown error into a safe JSON error response.
 * Maps Prisma error codes and the auth guard to proper statuses;
 * everything else becomes `fallbackMessage` with status 500.
 *
 * `uniqueConflictMessage` replaces the generic P2002 text for entities whose
 * unique values (slug, name) can still be held by a soft-deleted row.
 */
export function errorResponseFrom(
  error: unknown,
  fallbackMessage = "Internal Server Error",
  uniqueConflictMessage?: string,
) {
  const info = handleApiError(
    error,
    fallbackMessage,
    "Record",
    uniqueConflictMessage,
  );
  return errorResponse(info.message, info.status);
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status = 200,
) {
  return NextResponse.json({ data, pagination }, { status });
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)),
  );
  const search = searchParams.get("search") || undefined;
  const skip = (page - 1) * pageSize;
  return { page, pageSize, search, skip };
}
