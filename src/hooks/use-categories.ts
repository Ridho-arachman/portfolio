"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import type { PaginationParams } from "@/types/api";

// Public hooks
export function usePublicCategories() {
  return useQuery({
    queryKey: ["public-categories"],
    queryFn: () => fetchOne("/public/categories"),
    staleTime: 10 * 60 * 1000,
  });
}

// Admin hooks
export function useAdminCategories(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ["admin-categories", params],
    queryFn: () => fetchPaginated("/admin/categories", params),
  });
}

export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: ["admin-category", id],
    queryFn: () => fetchOne(`/admin/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createOne("/admin/categories", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateOne(`/admin/categories/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["admin-category"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });
}
