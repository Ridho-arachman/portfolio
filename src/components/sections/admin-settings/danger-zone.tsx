"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_SETTINGS } from "./constants";
import { useSettingsStore } from "./settings-store";
import { SettingsSection } from "./settings-section";

export function DangerZone() {
  const reset = useSettingsStore((state) => state.reset);
  const [confirming, setConfirming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsResetting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset();
    setConfirming(false);
    setIsResetting(false);
  };

  return (
    <SettingsSection
      title={ADMIN_SETTINGS.dangerTitle}
      subtitle={ADMIN_SETTINGS.dangerSubtitle}
      className="border-destructive/25"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
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
          onClick={handleReset}
          disabled={isResetting}
          className={cn(
            "shrink-0 rounded-full font-semibold",
            confirming
              ? "bg-destructive text-white hover:bg-destructive/90"
              : "border border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10",
          )}
        >
          {isResetting ? (
            <RotateCcw className="h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {confirming
            ? ADMIN_SETTINGS.resetConfirmLabel
            : ADMIN_SETTINGS.resetLabel}
        </Button>
      </div>
    </SettingsSection>
  );
}
