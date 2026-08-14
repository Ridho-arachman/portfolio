"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_SETTINGS,
  profileSchema,
  type ProfileFormValues,
} from "./constants";
import { SaveButton } from "./save-button";
import { useSettingsStore } from "./settings-store";
import { SettingsSection } from "./settings-section";

export function ProfileForm() {
  const profile = useSettingsStore((state) => state.settings.profile);
  const updateProfile = useSettingsStore((state) => state.updateProfile);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: profile,
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateProfile(values);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.profileTitle}
      subtitle={ADMIN_SETTINGS.profileSubtitle}
      footer={
        <SaveButton isSaving={isSaving} saved={saved} />
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
