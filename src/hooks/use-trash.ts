"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOne, deleteOne, fetchPaginated } from "@/lib/api-client";
import { toast } from "sonner";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import {
  ADMIN_TRASH,
  TRASH_ENTITIES,
  type TrashEntityKey,
  type TrashRow,
} from "@/components/sections/admin-trash/constants";

const TRASH_LIST_KEY = "admin-trash";

export function useTrash(
  entity: TrashEntityKey,
  params?: Partial<PaginationParams>,
) {
  return useQuery<PaginatedResponse<TrashRow>>({
    queryKey: [TRASH_LIST_KEY, entity, params],
    // Server membandingkan `?trashed=true` sebagai string ketat, jadi `1` atau
    // flag tanpa nilai akan diam-diam mengembalikan baris live, bukan trash.
    queryFn: () => fetchPaginated<TrashRow>(`/admin/${entity}?trashed=true`, params),
  });
}

export function useRestoreFromTrash() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ entity, id }: { entity: TrashEntityKey; id: string }) =>
      createOne(`/admin/${entity}/${id}/restore`, {}),
    onSuccess: (_row, { entity }) => {
      qc.invalidateQueries({ queryKey: [TRASH_LIST_KEY, entity] });
      qc.invalidateQueries({ queryKey: [TRASH_ENTITIES[entity].listQueryKey] });
      toast.success(ADMIN_TRASH.restoredToast);
    },
    onError: (error: Error) => {
      toast.error(error.message || ADMIN_TRASH.restoreFailedToast);
    },
  });
}

export function usePurgeFromTrash() {
  const qc = useQueryClient();

  return useMutation({
    // `confirm=true` dibaca dari query string, bukan body — tanpa itu purge
    // menjawab 400 dan tidak menghapus apa pun.
    mutationFn: ({ entity, id }: { entity: TrashEntityKey; id: string }) =>
      deleteOne(`/admin/${entity}/${id}/purge?confirm=true`),
    onSuccess: (_result, { entity }) => {
      qc.invalidateQueries({ queryKey: [TRASH_LIST_KEY, entity] });
      qc.invalidateQueries({ queryKey: [TRASH_ENTITIES[entity].listQueryKey] });
      toast.success(ADMIN_TRASH.purgeSuccessToast);
    },
    onError: (error: Error) => {
      toast.error(error.message || ADMIN_TRASH.purgeFailedToast);
    },
  });
}
