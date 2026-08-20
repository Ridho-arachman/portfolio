"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { PaginationParams } from "@/types/api";

// Public hooks
export function usePublicCertificates(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ["public-certificates", params],
    queryFn: () => fetchPaginated("/public/certificates", params),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicCertificate(slug: string) {
  return useQuery({
    queryKey: ["public-certificate", slug],
    queryFn: () => fetchOne(`/public/certificates/${slug}`),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

// Admin hooks
export function useAdminCertificates(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ["admin-certificates", params],
    queryFn: () => fetchPaginated("/admin/certificates", params),
  });
}

export function useAdminCertificate(id: string) {
  return useQuery({
    queryKey: ["admin-certificate", id],
    queryFn: () => fetchOne(`/admin/certificates/${id}`),
    enabled: !!id,
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createOne("/admin/certificates", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast.success("Certificate created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create certificate");
    },
  });
}

export function useUpdateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateOne(`/admin/certificates/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
      qc.invalidateQueries({ queryKey: ["admin-certificate"] });
      toast.success("Certificate updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update certificate");
    },
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/certificates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast.success("Certificate deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete certificate");
    },
  });
}
