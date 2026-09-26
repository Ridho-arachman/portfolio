"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowDown, ArrowUp } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { siteSchema, type SiteFormValues } from "@/schema/settings";
import { useAdminSettings, useUpdateSettings } from "@/hooks/use-settings";
import type { SiteSettings } from "@/lib/settings";
import {
  DEFAULT_QUICK_LINK_KEYS,
  isQuickLinkKey,
  type QuickLinkKey,
} from "@/lib/quick-links";
import { ADMIN_SETTINGS, QUICK_LINK_LABELS } from "./constants";
import { SaveButton } from "./save-button";
import { SettingsSection } from "./settings-section";

function toFormValues(settings: SiteSettings): SiteFormValues {
  return {
    siteName: settings.siteName,
    tagline: settings.tagline,
  };
}

export function SiteForm() {
  const { data: settings } = useAdminSettings();
  const { mutate, isPending, isSuccess, isError } = useUpdateSettings();

  // `siteSchema` cuma punya siteName/tagline, jadi urutan quick links hidup di
  // state sendiri. Indeks array = urutan yang dikirim ke API, jadi reorder cukup
  // menukar dua elemen — tidak ada nomor order terpisah yang bisa meleset.
  //
  // Draft admin hanya dipakai selama masih sinkron dengan nilai server: begitu
  // server berubah (ini di-save, atau di-reset dari Danger Zone) draft-nya
  // dibuang dan urutan server yang dipakai lagi. Dihitung saat render, bukan
  // di dalam effect, supaya tidak ada setState kedua yang menyala.
  const stored = (settings?.quickLinks ?? []).filter(isQuickLinkKey);
  const storedKey = stored.join(",");
  const [draft, setDraft] = useState<{
    base: string;
    order: QuickLinkKey[];
  } | null>(null);

  const quickLinks = draft?.base === storedKey ? draft.order : stored;
  const update = (order: QuickLinkKey[]) =>
    setDraft({ base: storedKey, order });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    mode: "onTouched",
    values: settings ? toFormValues(settings) : undefined,
  });

  const onSubmit = (values: SiteFormValues) => {
    mutate({ site: values, quickLinks });
  };

  const toggle = (key: QuickLinkKey) =>
    update(
      quickLinks.includes(key)
        ? quickLinks.filter((item) => item !== key)
        : // Toggle menambah ke belakang: urutan bawaan nav, bukan urutan klik.
          [...quickLinks, key],
    );

  const move = (key: QuickLinkKey, offset: -1 | 1) => {
    const from = quickLinks.indexOf(key);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= quickLinks.length) return;

    const next = [...quickLinks];
    [next[from], next[to]] = [next[to], next[from]];
    update(next);
  };

  // Dipilih dulu (urutan yang akan disimpan), baru yang belum dipilih.
  const rows: QuickLinkKey[] = [
    ...quickLinks,
    ...DEFAULT_QUICK_LINK_KEYS.filter((key) => !quickLinks.includes(key)),
  ];

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.siteTitle}
      subtitle={ADMIN_SETTINGS.siteSubtitle}
      footer={
        <SaveButton
          formId="settings-site-form"
          isSaving={isPending}
          saved={isSuccess && !isDirty && !isError}
        />
      }
    >
      <form id="settings-site-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siteName">{ADMIN_SETTINGS.fieldSiteName}</Label>
            <Input
              id="siteName"
              aria-invalid={errors.siteName ? true : undefined}
              {...register("siteName")}
            />
            {errors.siteName && (
              <p className="text-xs text-destructive">{errors.siteName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">{ADMIN_SETTINGS.fieldTagline}</Label>
            <Input
              id="tagline"
              aria-invalid={errors.tagline ? true : undefined}
              {...register("tagline")}
            />
            {errors.tagline && (
              <p className="text-xs text-destructive">{errors.tagline.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-glass-border pt-5">
          <h3 className="font-medium text-text-primary">
            {ADMIN_SETTINGS.quickLinksTitle}
          </h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            {ADMIN_SETTINGS.quickLinksSubtitle}
          </p>

          <ul className="mt-4 space-y-2">
            {rows.map((key) => {
              const position = quickLinks.indexOf(key);
              const isOn = position >= 0;
              const label = QUICK_LINK_LABELS[key];

              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass-bg/60 px-3 py-2"
                >
                  <span className="w-6 shrink-0 text-center text-xs text-text-muted">
                    {isOn ? position + 1 : "—"}
                  </span>

                  <Label
                    htmlFor={`quick-link-${key}`}
                    className="flex-1 cursor-pointer"
                  >
                    {label}
                  </Label>

                  {isOn && (
                    <span className="flex shrink-0 items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={position === 0}
                        onClick={() => move(key, -1)}
                        aria-label={ADMIN_SETTINGS.quickLinkMoveUp.replace(
                          "{label}",
                          label,
                        )}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={position === quickLinks.length - 1}
                        onClick={() => move(key, 1)}
                        aria-label={ADMIN_SETTINGS.quickLinkMoveDown.replace(
                          "{label}",
                          label,
                        )}
                      >
                        <ArrowDown />
                      </Button>
                    </span>
                  )}

                  <Switch
                    id={`quick-link-${key}`}
                    checked={isOn}
                    onCheckedChange={() => toggle(key)}
                    aria-label={label}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </form>
    </SettingsSection>
  );
}
