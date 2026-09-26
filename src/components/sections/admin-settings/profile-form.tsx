"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/schema/settings";
import { useAdminSettings, useUpdateSettings } from "@/hooks/use-settings";
import type { SiteSettings } from "@/lib/settings";
import { ADMIN_SETTINGS } from "./constants";
import { SaveButton } from "./save-button";
import { SettingsSection } from "./settings-section";

/**
 * Nama field form ("title", "email") berbeda dari nama kolom `site_settings`
 * ("jobTitle", "contactEmail") yang jadi body PUT, jadi dipetakan di dua arah:
 * form -> PUT di `onSubmit`, PUT -> form di sini.
 */
function toFormValues(settings: SiteSettings): ProfileFormValues {
  return {
    fullName: settings.fullName,
    title: settings.jobTitle,
    email: settings.contactEmail,
    location: settings.location,
    bio: settings.bio,
  };
}

export function ProfileForm() {
  const { data: settings } = useAdminSettings();
  const { mutate, isPending, isSuccess, isError } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    // `values`, bukan `defaultValues`: form harus ikut berubah saat query selesai
    // dimuat dan setelah reset di Danger Zone. RHF hanya me-reset kalau nilainya
    // benar-benar berubah, jadi refetch dengan data yang sama tidak menimpa
    // ketikan yang belum di-save.
    values: settings ? toFormValues(settings) : undefined,
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutate({
      profile: {
        fullName: values.fullName,
        jobTitle: values.title,
        bio: values.bio,
        location: values.location,
        contactEmail: values.email,
      },
    });
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.profileTitle}
      subtitle={ADMIN_SETTINGS.profileSubtitle}
      footer={
        <SaveButton
          formId="settings-profile-form"
          isSaving={isPending}
          saved={isSuccess && !isDirty && !isError}
        />
      }
    >
      <form id="settings-profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">{ADMIN_SETTINGS.fieldFullName}</Label>
            <Input
              id="fullName"
              aria-invalid={errors.fullName ? true : undefined}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{ADMIN_SETTINGS.fieldTitle}</Label>
            <Input
              id="title"
              aria-invalid={errors.title ? true : undefined}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{ADMIN_SETTINGS.fieldEmail}</Label>
            <Input
              id="email"
              type="email"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{ADMIN_SETTINGS.fieldLocation}</Label>
            <Input
              id="location"
              aria-invalid={errors.location ? true : undefined}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">{ADMIN_SETTINGS.fieldBio}</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder={ADMIN_SETTINGS.fieldBioPlaceholder}
              aria-invalid={errors.bio ? true : undefined}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </form>
    </SettingsSection>
  );
}
