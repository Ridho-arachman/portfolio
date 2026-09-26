"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@/lib/zod-resolver";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  passwordSchema,
  type PasswordFormValues,
} from "@/schema/settings";
import { authClient } from "@/lib/auth-client";
import { ADMIN_SETTINGS } from "./constants";
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

  const onSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true);

    // `confirmPassword` hanya validasi client-side, jadi sengaja tidak dikirim:
    // body better-auth hanya punya newPassword/currentPassword/revokeOtherSessions.
    // `revokeOtherSessions: true` menghapus semua session lalu menerbitkan
    // session baru untuk browser ini, jadi admin yang sedang login tetap masuk
    // sementara token di device lain langsung invalid.
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    setIsSaving(false);

    if (error) {
      toast.error(error.message || ADMIN_SETTINGS.passwordError);
      return;
    }

    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success(ADMIN_SETTINGS.passwordSuccess);
    setSaved(true);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.securityTitle}
      subtitle={ADMIN_SETTINGS.securitySubtitle}
      footer={
        <SaveButton formId="settings-password-form" isSaving={isSaving} saved={saved} />
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
        </div>
      </form>
    </SettingsSection>
  );
}
