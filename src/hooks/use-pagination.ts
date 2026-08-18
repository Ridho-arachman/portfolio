"use client";

import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useCallback, useMemo } from "react";

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  defaultSearch?: string;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultSearch = "",
  } = options;

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(defaultPage),
  );
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(defaultPageSize),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(defaultSearch),
  );

  const goToPage = useCallback(
    (p: number) => setPage(p),
    [setPage],
  );

  const nextPage = useCallback(
    () => setPage((p) => p + 1),
    [setPage],
  );

  const prevPage = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [setPage],
  );

  const resetPage = useCallback(() => setPage(1), [setPage]);

  const paginationParams = useMemo(
    () => ({ page, pageSize, search: search || undefined }),
    [page, pageSize, search],
  );

  return {
    page,
    pageSize,
    search,
    setSearch,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    paginationParams,
  };
}
