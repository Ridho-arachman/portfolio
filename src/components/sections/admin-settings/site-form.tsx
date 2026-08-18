"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_SETTINGS,
  siteSchema,
  type SiteFormValues,
} from "./constants";
import { SaveButton } from "./save-button";
import { useSettingsStore } from "./settings-store";
import { SettingsSection } from "./settings-section";

export function SiteForm() {
  const site = useSettingsStore((state) => state.settings.site);
  const updateSite = useSettingsStore((state) => state.updateSite);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    mode: "onTouched",
    defaultValues: site,
  });

  const onSubmit = (values: SiteFormValues) => {
    setIsSaving(true);
    updateSite(values);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.siteTitle}
      subtitle={ADMIN_SETTINGS.siteSubtitle}
      footer={
        <SaveButton isSaving={isSaving} saved={saved} />
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
      </form>
    </SettingsSection>
  );
}
