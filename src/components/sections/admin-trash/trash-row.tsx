"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { ADMIN_TRASH, type TrashEntity, type TrashRow } from "./constants";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface TrashRowItemProps {
  row: TrashRow;
  entity: TrashEntity;
  isPending: boolean;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
}

export function TrashRowItem({
  row,
  entity,
  isPending,
  onRestore,
  onPurge,
}: TrashRowItemProps) {
  const primary = row[entity.primaryField] ?? row.id;
  const rawSecondary = entity.secondaryField ? row[entity.secondaryField] : null;
  const secondary =
    rawSecondary && entity.secondaryField === "slug"
      ? `/${rawSecondary}`
      : rawSecondary;

  return (
    <li>
      <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{primary}</p>
          {secondary && (
            <p className="truncate font-mono text-xs text-text-muted">
              {secondary}
            </p>
          )}
          {row.deletedAt && (
            <p className="mt-1 text-[10px] text-text-muted">
              {ADMIN_TRASH.deletedAtLabel} {formatDate(row.deletedAt)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRestore(row.id)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" />
            {ADMIN_TRASH.restoreLabel}
          </button>
          <button
            type="button"
            onClick={() => onPurge(row.id)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" />
            {ADMIN_TRASH.purgeLabel}
          </button>
        </div>
      </div>
    </li>
  );
}
