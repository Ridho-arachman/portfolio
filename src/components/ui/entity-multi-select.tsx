"use client";

import { useId, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TAP_TARGET_HIT_AREA } from "@/lib/tap-target";
import { cn } from "@/lib/utils";

export interface EntityMultiSelectOption {
  id: string;
  label: string;
}

interface EntityMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  options: EntityMultiSelectOption[];
  label: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
}

/**
 * Multi-select for admin many-to-many pickers (which projects/certificates/
 * experiences are linked).
 *
 * A toggle list instead of a combobox on purpose: every option is a real
 * `<button>` with `aria-pressed`, so keyboard support, focus order and the
 * selected state come from the platform. A combobox would add a popover, a
 * listbox, arrow-key roving focus and outside-click dismissal — all of it
 * untestable in jsdom — to save a scrollbar. Portfolio option lists are in the
 * tens, not thousands.
 *
 * A selected id that has no matching option (a linked row that is now in the
 * trash) still renders as a removable chip, because the admin payloads use
 * `set` semantics: dropping it silently would unlink it on the next save.
 */
export function EntityMultiSelect({
  value,
  onChange,
  options,
  label,
  searchPlaceholder = "Search...",
  emptyLabel = "Nothing available yet.",
  disabled = false,
}: EntityMultiSelectProps) {
  const labelId = useId();
  const [query, setQuery] = useState("");

  const labelFor = useMemo(() => {
    const byId = new Map(options.map((option) => [option.id, option.label]));
    return (id: string) => byId.get(id) ?? id;
  }, [options]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );

  return (
    <div className="w-full">
      <Label id={labelId} className="mb-2 block text-sm font-medium">
        {label}
      </Label>

      <div
        role="group"
        aria-labelledby={labelId}
        className="rounded-xl border border-glass-border bg-glass-bg/40 p-3"
      >
        {value.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {value.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-4xl bg-accent/15 px-2 py-0.5 text-xs text-accent"
              >
                {labelFor(id)}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${labelFor(id)}`}
                  onClick={() => onChange(value.filter((v) => v !== id))}
                  className={cn(
                    "rounded-full outline-none hover:bg-accent/25 focus-visible:ring-2 focus-visible:ring-accent/50",
                    TAP_TARGET_HIT_AREA,
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={disabled}
              onClick={() => onChange([])}
              className="text-text-muted"
            >
              Clear all
            </Button>
          </div>
        ) : (
          <p className="mb-3 text-xs text-text-muted">{emptyLabel}</p>
        )}

        <Input
          value={query}
          disabled={disabled}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="mb-3 h-9"
        />

        <div className="flex max-h-48 flex-wrap content-start gap-2 overflow-y-auto">
          {visible.map((option) => {
            const selected = value.includes(option.id);
            return (
              <Button
                key={option.id}
                type="button"
                variant="outline"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => toggle(option.id)}
                className={cn(
                  "h-7 gap-1 rounded-full px-2.5 text-xs",
                  selected &&
                    "border-accent/50 bg-accent/15 text-accent hover:bg-accent/25",
                  TAP_TARGET_HIT_AREA,
                )}
              >
                {selected && <Check className="h-3 w-3" />}
                {option.label}
              </Button>
            );
          })}
          {visible.length === 0 && (
            <p className="text-xs text-text-muted">{emptyLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}