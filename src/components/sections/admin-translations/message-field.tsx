"use client";

import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ADMIN_TRANSLATIONS } from "./constants";
import type { EditableField } from "./message-tree";

const fill = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );

interface MessageFieldProps {
  field: EditableField;
  value: string;
  overridden: boolean;
  onEdit: (value: string) => void;
  onReset: () => void;
  readOnly?: boolean;
}

export function MessageField({
  field,
  value,
  overridden,
  onEdit,
  onReset,
  readOnly,
}: MessageFieldProps) {
  const inputId = `t-${field.path}`;

  if (readOnly) {
    return (
      <li className="grid gap-2 rounded-xl border border-dashed border-glass-border bg-bg-secondary/40 px-3 py-3 sm:grid-cols-[minmax(0,16rem)_1fr_auto] sm:items-center sm:gap-3">
        <Label
          htmlFor={inputId}
          title={field.path}
          className="min-w-0 truncate font-mono text-xs font-normal text-text-secondary"
        >
          {field.path}
        </Label>

        <Input id={inputId} value={value} readOnly disabled aria-readonly="true" />

        <div className="flex items-center gap-2 sm:justify-end">
          <Badge variant="outline" title={ADMIN_TRANSLATIONS.settingsOwnedLabel}>
            {ADMIN_TRANSLATIONS.settingsOwnedLabel}
          </Badge>
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "grid gap-2 rounded-xl border px-3 py-3 sm:grid-cols-[minmax(0,16rem)_1fr_auto] sm:items-center sm:gap-3",
        overridden
          ? "border-accent/40 bg-accent/5"
          : "border-dashed border-glass-border bg-bg-secondary/40",
      )}
    >
      <Label
        htmlFor={inputId}
        title={field.path}
        className="min-w-0 truncate font-mono text-xs font-normal text-text-secondary"
      >
        {field.path}
      </Label>

      <Input
        id={inputId}
        value={value}
        onChange={(event) => onEdit(event.target.value)}
      />

      <div className="flex items-center gap-2 sm:justify-end">
        <Badge variant={overridden ? "default" : "outline"}>
          {overridden
            ? ADMIN_TRANSLATIONS.overrideLabel
            : ADMIN_TRANSLATIONS.inheritedLabel}
        </Badge>
        {overridden && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onReset}
            aria-label={fill(ADMIN_TRANSLATIONS.clearLabel, { path: field.path })}
          >
            <RotateCcw />
          </Button>
        )}
      </div>
    </li>
  );
}

export function SkippedMessageField({
  path,
  kind,
}: {
  path: string;
  kind: string;
}) {
  return (
    <li className="rounded-xl border border-dashed border-glass-border bg-bg-secondary/20 px-3 py-2 text-xs text-text-secondary">
      {fill(ADMIN_TRANSLATIONS.skippedNote, { path, kind })}
    </li>
  );
}
