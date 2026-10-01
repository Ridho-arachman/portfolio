import { SI_ICON_NAMES } from "./si-icon-names";

/**
 * Every Simple Icons export name for the admin skill form's icon picker,
 * served from a static string list — deliberately NOT
 * `Object.keys(await import("react-icons/si"))`: a runtime namespace import
 * of the barrel forces bundlers to keep all ~3.4k icons (~1.9MB gzip) in the
 * shared chunk that public pages load. See `scripts/generate-si-icon-names.mjs`
 * to regenerate the list after a react-icons upgrade.
 */
export async function loadAllIconNames(): Promise<ReadonlySet<string>> {
  return new Set(SI_ICON_NAMES);
}
