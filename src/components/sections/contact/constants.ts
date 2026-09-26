import type { Messages } from "@/lib/translation-types";

export const CONTACT_EMAIL = "ridho@example.com";


export function getContactLocation(t: Messages): string {
  return t.contact.location;
}

export function getContactResponseTime(t: Messages): string {
  return t.contact.responseTimeValue;
}

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
} as const;

export const CONTACT_FORM_FIELDS = [
  { name: "name", labelKey: "name", placeholderKey: "namePlaceholder" },
  { name: "email", labelKey: "email", placeholderKey: "emailPlaceholder" },
  { name: "subject", labelKey: "subject", placeholderKey: "subjectPlaceholder" },
] as const;
