"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createOne, fetchOne, updateOne } from "@/lib/api-client";
import { toast } from "sonner";
import type { Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/translation-types";
// `import type` saja: `@/lib/translations` instantiate PrismaClient di level
// modul, jadi import runtime-nya akan menyeret client bundle ke server code.
import type { TranslationPatchValues } from "@/lib/translations";

const TRANSLATIONS_KEY = ["admin-translations"];

/** Satu baris per locale: dokumen efektif + patch mentah yang benar-benar tersimpan. */
export interface LocaleTranslations {
  locale: Locale;
  messages: Messages;
  /** Key yang benar-benar ada di DB; sisanya diwarisi dari dokumen bawaan. */
  patch: Record<string, string>;
  /** ISO timestamp row DB; null bila belum ada row. Untuk optimistic concurrency. */
  updatedAt: string | null;
}

export interface UpdateTranslationsInput extends TranslationPatchValues {
  locale: Locale;
  expectedUpdatedAt?: string | null;
}

export function useAdminTranslations() {
  return useQuery<LocaleTranslations[]>({
    queryKey: TRANSLATIONS_KEY,
    // GET tidak menerima `locale`: satu respons sudah memuat semua locale, jadi
    // pindah bahasa cukup membandingkan ulang isi array — tanpa jaringan.
    queryFn: () => fetchOne<LocaleTranslations[]>("/admin/translations"),
    staleTime: 30 * 1000,
  });
}

export function useUpdateTranslations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ locale, values, expectedUpdatedAt }: UpdateTranslationsInput) =>
      updateOne<LocaleTranslations>(
        `/admin/translations?locale=${encodeURIComponent(locale)}`,
        expectedUpdatedAt ? { values, expectedUpdatedAt } : { values },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSLATIONS_KEY });
      toast.success("Translations updated successfully");
    },
    onError: (error: Error) => {
      if (/changed since/i.test(error.message)) {
        qc.invalidateQueries({ queryKey: TRANSLATIONS_KEY });
      }
      toast.error(error.message || "Failed to update translations");
    },
  });
}

export function useResetTranslations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locale?: Locale) =>
      createOne<{ reset: string }>(
        "/admin/translations/reset",
        locale ? { locale } : {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSLATIONS_KEY });
      toast.success("Translations reset to bundled values");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset translations");
    },
  });
}
