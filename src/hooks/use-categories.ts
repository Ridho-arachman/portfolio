"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import type { AdminCategory } from "@/components/sections/admin-categories/constants";
import { type CategoryCreateValues, type CategoryUpdateValues } from "@/schema/category";

// Public hooks
export function usePublicCategories() {
  return useQuery<AdminCategory[]>({
    queryKey: ["public-categories"],
    queryFn: () => fetchOne("/public/categories"),
    staleTime: 10 * 60 * 1000,
  });
}

// Admin hooks
export function useAdminCategories(params?: Partial<PaginationParams>) {
  return useQuery<PaginatedResponse<AdminCategory>>({
    queryKey: ["admin-categories", params],
    queryFn: () => fetchPaginated<AdminCategory>("/admin/categories", params),
  });
}

export function useAdminCategory(id: string) {
  return useQuery<AdminCategory>({
    queryKey: ["admin-category", id],
    queryFn: () => fetchOne(`/admin/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreateValues) => createOne("/admin/categories", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateValues }) => updateOne(`/admin/categories/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["admin-category"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}
