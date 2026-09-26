"use client";

import { Settings2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_SETTINGS } from "./constants";
import { DangerZone } from "./danger-zone";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";
import { SiteForm } from "./site-form";
import { SocialsForm } from "./socials-form";

export function SettingsPage() {
  // Form memetakan nilai efektif dari query ini. Sebelum query selesai, form akan
  // tampil kosong — administrator bisa langsung menekan Save dan menimpa isi DB,
  // jadi tunggu data dulu.
  const { isPending } = useAdminSettings();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_SETTINGS.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_SETTINGS.subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {isPending ? (
            <div className="space-y-6" aria-busy="true">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          ) : (
            <>
              <ProfileForm />
              <SocialsForm />
              <SiteForm />
              <PasswordForm />
              <DangerZone />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
