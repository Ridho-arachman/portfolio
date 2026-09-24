"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import type { AdminSkill } from "@/components/sections/admin-skills/constants";

// Public hooks
export function usePublicSkills() {
  return useQuery<AdminSkill[]>({
    queryKey: ["public-skills"],
    queryFn: () => fetchOne("/public/skills"),
    staleTime: 10 * 60 * 1000,
  });
}

// Admin hooks
export function useAdminSkills(params?: Partial<PaginationParams>) {
  return useQuery<PaginatedResponse<AdminSkill>>({
    queryKey: ["admin-skills", params],
    queryFn: () => fetchPaginated<AdminSkill>("/admin/skills", params),
  });
}

export function useAdminSkill(id: string) {
  return useQuery<AdminSkill>({
    queryKey: ["admin-skill", id],
    queryFn: () => fetchOne(`/admin/skills/${id}`),
    enabled: !!id,
  });
}

import { type SkillCreateValues, type SkillUpdateValues } from "@/schema/skill";

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SkillCreateValues) => createOne("/admin/skills", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-skills"] }),
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SkillUpdateValues }) => updateOne(`/admin/skills/${id}`, data),
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
