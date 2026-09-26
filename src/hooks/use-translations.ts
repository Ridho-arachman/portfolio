"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOne, updateOne } from "@/lib/api-client";
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
  /** Yang dirender situs publik setelah patch diterapkan. */
  messages: Messages;
  /** Key yang benar-benar ada di DB; sisanya diwarisi dari dokumen bawaan. */
  patch: Record<string, string>;
}

export interface UpdateTranslationsInput extends TranslationPatchValues {
  locale: Locale;
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
    // Datar + locale di query param: server memvalidasi tiap path terhadap shape
    // turunan en.json, jadi dokumen bersarang akan ditolak 400.
    mutationFn: ({ locale, values }: UpdateTranslationsInput) =>
      updateOne<LocaleTranslations>(
        `/admin/translations?locale=${encodeURIComponent(locale)}`,
        { values },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSLATIONS_KEY });
      toast.success("Translations updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update translations");
    },
  });
}
