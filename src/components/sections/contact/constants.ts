import { z } from "zod";

export const CONTACT_EMAIL = "ridho@example.com";
export const CONTACT_LOCATION = "Indonesia (Remote-ready)";
export const CONTACT_RESPONSE_TIME = "Usually replies within 24 hours";

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
} as const;

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const CONTACT_FORM_FIELDS = [
  { name: "name", label: "Name", placeholder: "Your name" },
  { name: "email", label: "Email", placeholder: "you@example.com" },
  { name: "subject", label: "Subject", placeholder: "What is this about?" },
] as const;
