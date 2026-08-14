"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_SETTINGS,
  passwordSchema,
  type PasswordFormValues,
} from "./constants";
import { SaveButton } from "./save-button";
import { SettingsSection } from "./settings-section";

export function PasswordForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.securityTitle}
      subtitle={ADMIN_SETTINGS.securitySubtitle}
      footer={
        <SaveButton isSaving={isSaving} saved={saved} />
      }
    >
      <form id="settings-password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="currentPassword">
              {ADMIN_SETTINGS.fieldCurrentPassword}
            </Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.currentPassword ? true : undefined}
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {ADMIN_SETTINGS.fieldNewPassword}
            </Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.newPassword ? true : undefined}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {ADMIN_SETTINGS.fieldConfirmPassword}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <p className="text-xs text-text-muted sm:col-span-2">
            {ADMIN_SETTINGS.passwordMockNote}
          </p>
        </div>
      </form>
    </SettingsSection>
  );
}
