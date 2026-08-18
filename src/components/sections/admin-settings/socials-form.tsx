"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_SETTINGS,
  socialsSchema,
  type SocialsFormValues,
} from "./constants";
import { SaveButton } from "./save-button";
import { useSettingsStore } from "./settings-store";
import { SettingsSection } from "./settings-section";

export function SocialsForm() {
  const socials = useSettingsStore((state) => state.settings.socials);
  const updateSocials = useSettingsStore((state) => state.updateSocials);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialsFormValues>({
    resolver: zodResolver(socialsSchema),
    mode: "onTouched",
    defaultValues: socials,
  });

  const onSubmit = (values: SocialsFormValues) => {
    setIsSaving(true);
    updateSocials({
      github: values.github ?? "",
      linkedin: values.linkedin ?? "",
      x: values.x ?? "",
      email: values.email ?? "",
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.socialsTitle}
      subtitle={ADMIN_SETTINGS.socialsSubtitle}
      footer={
        <SaveButton isSaving={isSaving} saved={saved} />
      }
    >
      <form id="settings-socials-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="github">{ADMIN_SETTINGS.fieldGithub}</Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/username"
              aria-invalid={errors.github ? true : undefined}
              {...register("github")}
            />
            {errors.github && (
              <p className="text-xs text-destructive">{errors.github.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">{ADMIN_SETTINGS.fieldLinkedin}</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              aria-invalid={errors.linkedin ? true : undefined}
              {...register("linkedin")}
            />
            {errors.linkedin && (
              <p className="text-xs text-destructive">{errors.linkedin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="x">{ADMIN_SETTINGS.fieldX}</Label>
            <Input
              id="x"
              type="url"
              placeholder="https://twitter.com/username"
              aria-invalid={errors.x ? true : undefined}
              {...register("x")}
            />
            {errors.x && (
              <p className="text-xs text-destructive">{errors.x.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialEmail">{ADMIN_SETTINGS.fieldSocialEmail}</Label>
            <Input
              id="socialEmail"
              type="email"
              placeholder="you@example.com"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>
      </form>
    </SettingsSection>
  );
}
