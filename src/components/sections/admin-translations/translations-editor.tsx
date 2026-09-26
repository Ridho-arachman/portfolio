"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, Languages, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SaveButton } from "@/components/sections/admin-settings/save-button";
import { DEFAULT_LOCALE, LOCALES, LOCALE_FLAGS, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAdminTranslations, useUpdateTranslations } from "@/hooks/use-translations";
import { ADMIN_TRANSLATIONS } from "./constants";
import { MessageField, SkippedMessageField } from "./message-field";
import { filterGroups, groupMessages, type MessageGroup } from "./message-tree";

const fill = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );

function shallowDiffers(
  a: Record<string, string>,
  b: Record<string, string>,
) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].some((key) => a[key] !== b[key]);
}

export function TranslationsEditor() {
  const { data, isPending, error } = useAdminTranslations();
  const { mutate, isPending: isSaving, isSuccess } = useUpdateTranslations();

  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<{
    base: string;
    values: Record<string, string>;
  } | null>(null);

  const entry = data?.find((item) => item.locale === locale);
  const patch = entry?.patch ?? {};
  // Draft dibuang begitu patch server berubah (di-save, atau locale diganti), jadi
  // tidak mungkin mengirim draft basi. Dihitung saat render supaya tidak ada
  // setState kedua di dalam effect.
  const base = JSON.stringify(patch);
  const values = draft?.base === base ? draft.values : patch;

  const groups = groupMessages(entry?.messages);
  const visible = filterGroups(groups, query, values);

  const searching = query.trim() !== "";
  const editable = groups.reduce((total, group) => total + group.fields.length, 0);

  // String kosong berarti "jangan persist", bukan "persist string kosong" —
  // server menolak nilai kosong dengan 400. Dipisah dari `values` supaya
  // mengosongkan field tidak langsung memunculkan lagi teks bundel di input,
  // tapi tetap tidak pernah ikut terkirim.
  const persistable = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== ""),
  );
  const dirty = shallowDiffers(patch, persistable);

  const isOpen = (group: MessageGroup) =>
    searching || (collapsed[group.namespace] ?? group.fields.some((f) => f.path in patch));

  const edit = (path: string, value: string) =>
    setDraft({ base, values: { ...values, [path]: value } });

  const reset = (path: string) => {
    const next = { ...values };
    delete next[path];
    setDraft({ base, values: next });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!dirty) return;
    mutate({ locale, values: persistable });
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
                  onClick={() => setLocale(item)}
                  className="rounded-full"
                >
                  {LOCALE_FLAGS[item]} {item.toUpperCase()}
                </Button>
              ))}
            </div>
            <SaveButton
              formId="translations-form"
              isSaving={isSaving}
              saved={isSuccess && !dirty}
            />
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {isPending ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : error ? (
            <p
              role="alert"
              className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive"
            >
              {error.message || ADMIN_TRANSLATIONS.errorTitle}
            </p>
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
              </div>

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
