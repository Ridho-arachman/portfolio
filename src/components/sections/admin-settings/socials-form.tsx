"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { socialsSchema, type SocialsFormValues } from "@/schema/settings";
import { useAdminSettings, useUpdateSettings } from "@/hooks/use-settings";
import type { SiteSettings } from "@/lib/settings";
import { ADMIN_SETTINGS } from "./constants";
import { SaveButton } from "./save-button";
import { SettingsSection } from "./settings-section";

function toFormValues(settings: SiteSettings): SocialsFormValues {
  return {
    github: settings.githubUrl,
    linkedin: settings.linkedinUrl,
    x: settings.twitterUrl,
    email: settings.contactEmail,
  };
}

export function SocialsForm() {
  const { data: settings } = useAdminSettings();
  const { mutate, isPending, isSuccess, isError } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SocialsFormValues>({
    resolver: zodResolver(socialsSchema),
    mode: "onTouched",
    values: settings ? toFormValues(settings) : undefined,
  });

  const onSubmit = (values: SocialsFormValues) => {
    mutate({
      socials: {
        githubUrl: values.github,
        linkedinUrl: values.linkedin,
        twitterUrl: values.x,
      },
      // `contactEmail` tinggal di grup `profile` (lihat profileUpdateSchema),
      // jadi email form ini dikirim sebagai override kolom yang sama.
      profile: { contactEmail: values.email },
    });
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.socialsTitle}
      subtitle={ADMIN_SETTINGS.socialsSubtitle}
      footer={
        <SaveButton
          formId="settings-socials-form"
          isSaving={isPending}
          saved={isSuccess && !isDirty && !isError}
        />
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
