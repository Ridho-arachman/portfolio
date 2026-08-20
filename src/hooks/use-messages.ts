"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaginated, fetchOne, updateOne, deleteOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { PaginationParams } from "@/types/api";

interface MessageFilters extends Partial<PaginationParams> {
  status?: string;
}

// Admin hooks
export function useAdminMessages<T = unknown>(params?: MessageFilters) {
  const url = params?.status ? `/admin/messages?status=${params.status}` : "/admin/messages";
  return useQuery({
    queryKey: ["admin-messages", params],
    queryFn: () => fetchPaginated<T>(url, params),
  });
}

export function useAdminMessage(id: string) {
  return useQuery({
    queryKey: ["admin-message", id],
    queryFn: () => fetchOne(`/admin/messages/${id}`),
    enabled: !!id,
  });
}

export function useUpdateMessageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOne(`/admin/messages/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-message"] });
      toast.success("Message status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update message status");
    },
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOne(`/admin/messages/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete message");
    },
  });
}
