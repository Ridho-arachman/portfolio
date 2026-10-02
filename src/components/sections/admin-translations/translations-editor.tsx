"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, Languages, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SaveButton } from "@/components/sections/admin-settings/save-button";
import { DEFAULT_LOCALE, LOCALES, LOCALE_FLAGS, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  useAdminTranslations,
  useResetTranslations,
  useUpdateTranslations,
} from "@/hooks/use-translations";
import { ADMIN_TRANSLATIONS } from "./constants";
import { MessageField, SkippedMessageField } from "./message-field";
import {
  filterGroups,
  groupMessages,
  isSettingsOwned,
  type MessageGroup,
} from "./message-tree";

const fill = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );

function shallowDiffers(a: Record<string, string>, b: Record<string, string>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].some((key) => a[key] !== b[key]);
}

function countDiffers(a: Record<string, string>, b: Record<string, string>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let count = 0;
  for (const key of keys) {
    if (a[key] !== b[key]) count += 1;
  }
  return count;
}

export function TranslationsEditor() {
  const { data, isPending, error, refetch } = useAdminTranslations();
  const {
    mutate,
    isPending: isSaving,
    isSuccess,
    error: saveError,
    reset: clearSaveError,
  } = useUpdateTranslations();
  const { mutate: resetLocale, isPending: isResetting } = useResetTranslations();

  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [draft, setDraft] = useState<{
    base: string;
    values: Record<string, string>;
  } | null>(null);

  const entry = data?.find((item) => item.locale === locale);
  const patch = entry?.patch ?? {};
  const base = JSON.stringify(patch);
  // Draft tidak pernah dibuang diam-diam saat patch server berubah (refetch):
  // tetap tampil sampai admin save / pindah locale / reset, yang masing-masing
  // minta konfirmasi bila dirty. Draft yang sudah sama dengan patch terbaru
  // diabaikan tanpa setState supaya tidak jadi phantom dirty. String kosong
  // tetap tampil di input tapi tidak ikut persistable.
  const draftStale =
    draft &&
    draft.base !== base &&
    !shallowDiffers(
      patch,
      Object.fromEntries(Object.entries(draft.values).filter(([, value]) => value !== "")),
    );
  const values = draft && (draft.base === base || !draftStale) ? draft.values : patch;

  const groups = groupMessages(entry?.messages);
  const visible = filterGroups(groups, query, values);

  const searching = query.trim() !== "";
  const editable = groups.reduce((total, group) => total + group.fields.length, 0);

  const persistable = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== ""),
  );
  const dirty = shallowDiffers(patch, persistable);
  const changedCount = countDiffers(patch, persistable);

  const isOpen = (group: MessageGroup) =>
    searching || (collapsed[group.namespace] ?? group.fields.some((f) => f.path in patch));

  const edit = (path: string, value: string) =>
    setDraft({ base, values: { ...values, [path]: value } });

  const reset = (path: string) => {
    const next = { ...values };
    delete next[path];
    setDraft({ base, values: next });
  };

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    if (dirty && !window.confirm(ADMIN_TRANSLATIONS.dirtyConfirm)) return;
    setDraft(null);
    setConfirmReset(false);
    setLocale(next);
  };

  const handleResetLocale = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    clearSaveError();
    setDraft(null);
    resetLocale(locale);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!dirty) return;
    if (draft && draft.base !== base && !window.confirm(ADMIN_TRANSLATIONS.staleConfirm)) return;
    clearSaveError();
    mutate({ locale, values: persistable, expectedUpdatedAt: entry?.updatedAt ?? undefined });
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_TRANSLATIONS.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_TRANSLATIONS.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label={ADMIN_TRANSLATIONS.localeLabel}
              className="flex items-center gap-1 rounded-full border border-glass-border p-1"
            >
              {LOCALES.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={item === locale ? "default" : "ghost"}
                  aria-pressed={item === locale}
                  onClick={() => switchLocale(item)}
                  className="rounded-full"
                >
                  {LOCALE_FLAGS[item]} {item.toUpperCase()}
                </Button>
              ))}
            </div>
            <span aria-live="polite" className="text-xs text-text-secondary">
              {fill(ADMIN_TRANSLATIONS.changedLabel, { count: changedCount })}
            </span>
            <SaveButton
              formId="translations-form"
              isSaving={isSaving}
              saved={isSuccess && !dirty && !saveError}
            />
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {isPending ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive"
            >
              <p>{error.message || ADMIN_TRANSLATIONS.errorTitle}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="mt-3 rounded-full"
              >
                <RotateCcw className="h-4 w-4" />
                {ADMIN_TRANSLATIONS.retryLabel}
              </Button>
            </div>
          ) : (
            <form id="translations-form" onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-glass-border bg-glass-bg/80 px-5 py-4 backdrop-blur-xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={ADMIN_TRANSLATIONS.searchPlaceholder}
                    aria-label={ADMIN_TRANSLATIONS.searchLabel}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {ADMIN_TRANSLATIONS.legend}
                </p>
                <p className="text-xs text-text-muted">
                  {fill(ADMIN_TRANSLATIONS.summaryLabel, {
                    editable,
                    overridden: Object.keys(persistable).length,
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleResetLocale}
                    disabled={isResetting}
                  >
                    <RotateCcw className={cn("h-4 w-4", isResetting && "animate-spin")} />
                    {confirmReset
                      ? ADMIN_TRANSLATIONS.resetConfirmLabel
                      : ADMIN_TRANSLATIONS.resetLabel}
                  </Button>
                </div>
              </div>

              {saveError && (
                <p
                  role="alert"
                  className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive"
                >
                  {saveError.message}
                </p>
              )}

              {visible.length === 0 ? (
                <p className="rounded-2xl border border-glass-border bg-glass-bg/80 px-5 py-8 text-center text-sm text-text-secondary">
                  {ADMIN_TRANSLATIONS.searchEmpty}
                </p>
              ) : (
                visible.map((group) => {
                  const open = isOpen(group);

                  return (
                    <div
                      key={group.namespace}
                      className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() =>
                          setCollapsed((prev) => ({
                            ...prev,
                            [group.namespace]: !open,
                          }))
                        }
                        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
                      >
                        <span className="text-sm font-semibold text-text-primary">
                          {fill(ADMIN_TRANSLATIONS.groupLabel, {
                            namespace: group.namespace,
                            count: group.fields.length,
                          })}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-text-muted transition-transform",
                            open && "rotate-180",
                          )}
                        />
                      </button>

                      {open && (
                        <ul className="space-y-2 border-t border-glass-border p-3 sm:p-4">
                          {group.fields.map((field) => (
                            <MessageField
                              key={field.path}
                              field={field}
                              value={values[field.path] ?? field.inherited}
                              overridden={field.path in persistable}
                              onEdit={(value) => edit(field.path, value)}
                              onReset={() => reset(field.path)}
                              readOnly={isSettingsOwned(field.path)}
                            />
                          ))}

                          {group.skipped.map((item) => (
                            <SkippedMessageField
                              key={item.path}
                              path={item.path}
                              kind={item.kind}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
