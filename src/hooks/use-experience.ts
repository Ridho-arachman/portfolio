"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import type { AdminExperience } from "@/components/sections/admin-experience/constants";

// Public hooks
export function usePublicExperiences(params?: Partial<PaginationParams>) {
  return useQuery<PaginatedResponse<AdminExperience>>({
    queryKey: ["public-experiences", params],
    queryFn: () => fetchPaginated("/public/experience", params),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicExperience(slug: string) {
  return useQuery<AdminExperience>({
    queryKey: ["public-experience", slug],
    queryFn: () => fetchOne(`/public/experience/${slug}`),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

// Admin hooks
export function useAdminExperiences(params?: Partial<PaginationParams>) {
  return useQuery<PaginatedResponse<AdminExperience>>({
    queryKey: ["admin-experiences", params],
    queryFn: () => fetchPaginated("/admin/experience", params),
  });
}

export function useAdminExperience(id: string) {
  return useQuery<AdminExperience>({
    queryKey: ["admin-experience", id],
    queryFn: () => fetchOne(`/admin/experience/${id}`),
    enabled: !!id,
  });
}

export function useCreateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createOne("/admin/experience", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experiences"] }),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateOne(`/admin/experience/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-experiences"] });
      qc.invalidateQueries({ queryKey: ["admin-experience"] });
    },
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/experience/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experiences"] }),
  });
}
