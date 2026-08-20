"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { PaginationParams } from "@/types/api";

// Public hooks
export function usePublicProjects(params?: Partial<PaginationParams> & { category?: string }) {
  const url = params?.category ? `/public/projects?category=${params.category}` : "/public/projects";
  return useQuery({
    queryKey: ["public-projects", params],
    queryFn: () => fetchPaginated(url, params),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicProject(slug: string) {
  return useQuery({
    queryKey: ["public-project", slug],
    queryFn: () => fetchOne(`/public/projects/${slug}`),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

// Admin hooks
export function useAdminProjects(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ["admin-projects", params],
    queryFn: () => fetchPaginated("/admin/projects", params),
  });
}

export function useAdminProject(id: string) {
  return useQuery({
    queryKey: ["admin-project", id],
    queryFn: () => fetchOne(`/admin/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createOne("/admin/projects", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Project created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateOne(`/admin/projects/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["admin-project"] });
      toast.success("Project updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}
