"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResetSettings } from "@/hooks/use-settings";
import { type SettingsSection as SettingsSectionKey } from "@/schema/settings";
import { ADMIN_SETTINGS, RESET_SECTIONS } from "./constants";
import { SettingsSection } from "./settings-section";

type ResetTarget = SettingsSectionKey | "all";

export function DangerZone() {
  const { mutate, isPending } = useResetSettings();
  const [confirming, setConfirming] = useState<ResetTarget | null>(null);

  // Reset benar-benar destruktif, jadi butuh dua klik: klik pertama hanya
  // armed-state, klik kedua baru memanggil endpoint reset.
  const handleReset = (target: ResetTarget) => {
    if (confirming !== target) {
      setConfirming(target);
      return;
    }
    setConfirming(null);
    mutate(target === "all" ? undefined : target);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.dangerTitle}
      subtitle={ADMIN_SETTINGS.dangerSubtitle}
      className="border-destructive/25"
    >
      <ul className="space-y-3">
        {RESET_SECTIONS.map((item) => {
          const isArmed = confirming === item.key;

          return (
            <li
              key={item.key}
              className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{item.label}</p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  {ADMIN_SETTINGS.resetSectionNote}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => handleReset(item.key)}
                disabled={isPending}
                // Empat tombol "Reset" dengan teks identik tidak bisa dibedakan
                // screen reader, jadi nama aksesibelnya membawa nama section.
                aria-label={
                  isArmed
                    ? ADMIN_SETTINGS.resetSectionConfirmAriaLabel.replace(
                        "{label}",
                        item.label,
                      )
                    : ADMIN_SETTINGS.resetSectionAriaLabel.replace(
                        "{label}",
                        item.label,
                      )
                }
                className={cn(
                  "shrink-0 rounded-full font-semibold",
                  isArmed
                    ? "bg-destructive text-white hover:bg-destructive/90"
                    : "border border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10",
                )}
              >
                {isPending && isArmed ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {isArmed
                  ? ADMIN_SETTINGS.resetSectionConfirmLabel
                  : ADMIN_SETTINGS.resetSectionLabel}
              </Button>
            </li>
          );
        })}

        <li className="flex flex-col items-start gap-3 border-t border-glass-border pt-4 sm:flex-row sm:items-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-primary">
              {ADMIN_SETTINGS.resetLabel}
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              {ADMIN_SETTINGS.dangerNote}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => handleReset("all")}
            disabled={isPending}
            className={cn(
              "shrink-0 rounded-full font-semibold",
              confirming === "all"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "border border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10",
            )}
          >
            {isPending && confirming === "all" ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {confirming === "all"
              ? ADMIN_SETTINGS.resetConfirmLabel
              : ADMIN_SETTINGS.resetLabel}
          </Button>
        </li>
      </ul>
    </SettingsSection>
  );
}
