import { NextResponse } from "next/server";
import type { PaginationMeta } from "@/types/api";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
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
