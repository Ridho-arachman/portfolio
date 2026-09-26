export const ADMIN_TRANSLATIONS = {
  title: "Translations",
  subtitle: "Override the message strings rendered on the public site, per locale.",
  searchLabel: "Search keys",
  searchPlaceholder: "Filter by key or value...",
  localeLabel: "Locale",
  legend:
    "Fields marked Inherited come from src/messages and are not stored in the database. Saving after editing one starts persisting it as an override.",
  inheritedLabel: "Inherited",
  overrideLabel: "Override",
  clearLabel: "Reset {path} to the bundled value",
  skippedNote:
    "{path} is a JSON {kind}, not a string. The patch API only accepts string values, so it cannot be overridden here.",
  summaryLabel: "{editable} editable keys, {overridden} overridden.",
  searchEmpty: "No key or value matches this search.",
  saveLabel: "Save Changes",
  savingLabel: "Saving...",
  savedLabel: "Saved",
  errorTitle: "Could not load translations",
  groupLabel: "{namespace} — {count} keys",
} as const;
