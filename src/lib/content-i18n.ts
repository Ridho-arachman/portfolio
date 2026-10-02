/**
 * Auto-translation glue for admin saves: admins write English, blank
 * Indonesian overrides are machine-filled before the Prisma write.
 *
 * - `fillMissingIdOverrides` is pure (translator injected, defaults to the
 *   real `translateTexts`) and never overwrites a non-blank manual value.
 * - `withAutoIdTranslations` merges the filled `id` object back into the
 *   request's translations container, preserving other locales and the
 *   existing passthrough behavior (undefined stays undefined so routes can
 *   keep their `?? Prisma.DbNull` convention).
 * - `translatableBase` picks the English source values for the given fields.
 */

import { translateTexts } from "./translate";

export type IdOverrideValue = string | string[];

export type IdOverrideMap = Partial<
  Record<string, IdOverrideValue | undefined>
>;

export interface IdTranslationsContainer {
  id?: IdOverrideMap;
}

function isBlank(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null;
}

/** English source values for `fields` out of a validated body/row object. */
export function translatableBase(
  source: Record<string, unknown>,
  fields: readonly string[],
): Record<string, IdOverrideValue> {
  const base: Record<string, IdOverrideValue> = {};
  for (const field of fields) {
    const value = source[field];
    if (typeof value === "string" || Array.isArray(value)) {
      base[field] = value as IdOverrideValue;
    }
  }
  return base;
}

/**
 * Fill blank Indonesian overrides from the English base. For each field:
 * keep the existing non-blank value; else machine-translate the base value
 * (arrays element-wise, blank results dropped); else leave the field absent.
 * A fully failed translation yields `{}` so the save inherits English.
 */
export async function fillMissingIdOverrides(
  base: Record<string, IdOverrideValue>,
  existing: IdOverrideMap | undefined | null,
  fields: readonly string[],
  translate: typeof translateTexts = translateTexts,
): Promise<Record<string, IdOverrideValue>> {
  const filled: Record<string, IdOverrideValue> = {};
  for (const field of fields) {
    const current = existing?.[field];
    if (current !== undefined && !isBlank(current)) {
      filled[field] = current;
      continue;
    }
    const source = base[field];
    if (source === undefined || isBlank(source)) continue;
    if (typeof source === "string") {
      const [translated] = await translate([source], "id");
      if (translated && translated.trim().length > 0) filled[field] = translated;
    } else {
      const translated = await translate(source, "id");
      const kept = translated.filter((s) => s.trim().length > 0);
      if (kept.length > 0) filled[field] = kept;
    }
  }
  return filled;
}

/**
 * Merge filled `id` overrides into the request translations. Returns the
 * original container untouched when nothing was filled (so `undefined`
 * stays `undefined` and routes keep their DbNull passthrough).
 */
export async function withAutoIdTranslations<
  T extends IdTranslationsContainer,
>(
  base: Record<string, IdOverrideValue>,
  translations: T | undefined,
  fields: readonly string[],
  translate: typeof translateTexts = translateTexts,
): Promise<T | undefined> {
  const filled = await fillMissingIdOverrides(
    base,
    translations?.id,
    fields,
    translate,
  );
  if (Object.keys(filled).length === 0) return translations;
  return { ...translations, id: filled } as T;
}
