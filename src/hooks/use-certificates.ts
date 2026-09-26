"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, createOne, updateOne, deleteOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import type { AdminCertificate } from "@/components/sections/admin-certificates/constants";
import { type CertificateCreateValues, type CertificateUpdateValues } from "@/schema/certificate";

// Admin hooks
export function useAdminCertificates(params?: Partial<PaginationParams>) {
  return useQuery<PaginatedResponse<AdminCertificate>>({
    queryKey: ["admin-certificates", params],
    queryFn: () => fetchPaginated<AdminCertificate>("/admin/certificates", params),
  });
}

export function useAdminCertificate(id: string) {
  return useQuery<AdminCertificate>({
    queryKey: ["admin-certificate", id],
    queryFn: () => fetchOne(`/admin/certificates/${id}`),
    enabled: !!id,
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CertificateCreateValues) => createOne("/admin/certificates", data),
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
    mutationFn: ({ id, data }: { id: string; data: CertificateUpdateValues }) => updateOne(`/admin/certificates/${id}`, data),
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
