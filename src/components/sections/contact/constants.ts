export const CONTACT_EMAIL = "ridho@example.com";
export const CONTACT_LOCATION = "Indonesia (Remote-ready)";
export const CONTACT_RESPONSE_TIME = "Usually replies within 24 hours";

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
} as const;

export const CONTACT_FORM_FIELDS = [
  { name: "name", label: "Name", placeholder: "Your name" },
  { name: "email", label: "Email", placeholder: "you@example.com" },
  { name: "subject", label: "Subject", placeholder: "What is this about?" },
] as const;
