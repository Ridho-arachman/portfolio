"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOne, updateOne, createOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { SiteSettings } from "@/lib/settings";
import { type SettingsSection, type SettingsUpdateValues } from "@/schema/settings";

const SETTINGS_KEY = ["admin-settings"];

export function useAdminSettings() {
  return useQuery<SiteSettings>({
    queryKey: SETTINGS_KEY,
    queryFn: () => fetchOne("/admin/settings"),
    // Lima form di halaman ini berbagi satu key, jadi satu fetch saja. staleTime
    // pendek supaya override dari tab lain terlihat tanpa reload manual, dan
    // cukup panjang supaya tidak menimpa ketikan admin yang belum di-save.
    staleTime: 30 * 1000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsUpdateValues) =>
      updateOne<SiteSettings>("/admin/settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success("Settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
}

export function useResetSettings() {
  const qc = useQueryClient();
  return useMutation({
    // Body kosong = reset semua section (lihat settingsResetSchema).
    mutationFn: (section?: SettingsSection) =>
      createOne<SiteSettings>(
        "/admin/settings/reset",
        section ? { section } : {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success("Settings reset to the environment defaults");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset settings");
    },
  });
}
