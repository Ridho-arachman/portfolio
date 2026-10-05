"use client";

import "nuqs/adapters/next";
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
  const [search, setSearchValue] = useQueryState(
    "search",
    parseAsString.withDefault(defaultSearch),
  );

  // Mengubah `search` harus sekaligus mengembalikan `page` ke 1. Keduanya query
  // param terpisah, jadi tanpa ini mencari dari halaman 3 membuat server menerima
  // `page=3` lalu mengambil baris 21-30 dari hasil yang mungkin cuma satu baris —
  // daftar tampil kosong, persis seperti search tidak berfungsi. Bug ini tersembunyi
  // selama data masih muat satu halaman. Miliki koupling-nya di sini supaya
  // setiap daftar ikut benar tanpa harus mengingatinya.
  const setSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    [setSearchValue, setPage],
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
