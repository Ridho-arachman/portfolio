"use client";

import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_SETTINGS } from "./constants";

export function SaveButton({
  isSaving,
  saved,
  formId,
}: {
  isSaving: boolean;
  saved: boolean;
  formId?: string;
}) {
  return (
    <Button
      type="submit"
      // Tombol ini dirender di footer `SettingsSection`, jadi berada di luar
      // elemen <form>. Tanpa atribut `form` submit-nya tidak pernah terkirim.
      form={formId}
      disabled={isSaving}
      className="rounded-full bg-accent font-semibold text-bg-primary hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {ADMIN_SETTINGS.savingLabel}
        </>
      ) : saved ? (
        <>
          <Check className="h-4 w-4" />
          {ADMIN_SETTINGS.savedLabel}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {ADMIN_SETTINGS.saveLabel}
        </>
      )}
    </Button>
  );
}
