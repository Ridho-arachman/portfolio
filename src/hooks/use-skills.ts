"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import type { PaginationParams } from "@/types/api";

// Public hooks
export function usePublicSkills() {
  return useQuery({
    queryKey: ["public-skills"],
    queryFn: () => fetchOne("/public/skills"),
    staleTime: 10 * 60 * 1000,
  });
}

// Admin hooks
export function useAdminSkills(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ["admin-skills", params],
    queryFn: () => fetchPaginated("/admin/skills", params),
  });
}

export function useAdminSkill(id: string) {
  return useQuery({
    queryKey: ["admin-skill", id],
    queryFn: () => fetchOne(`/admin/skills/${id}`),
    enabled: !!id,
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createOne("/admin/skills", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-skills"] }),
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateOne(`/admin/skills/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-skills"] });
      qc.invalidateQueries({ queryKey: ["admin-skill"] });
    },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/skills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-skills"] }),
  });
}
