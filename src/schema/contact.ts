import { z } from "zod";

// Translated strings for the client-side form, taken from
// messages.contact.form.validation (same shape in en.json and id.json).
export interface ContactValidationMessages {
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  subjectRequired: string;
  messageRequired: string;
  messageMinLength: string;
}

// Locale-aware factory for the public contact form: thresholds match
// contactFormSchema, only the messages come from the active locale.
export function createContactFormSchema(validation: ContactValidationMessages) {
  return z.object({
    name: z.string().min(2, validation.nameRequired).max(100),
    email: z
      .string()
      .min(1, validation.emailRequired)
      .max(254)
      .pipe(z.email(validation.emailInvalid)),
    subject: z.string().min(3, validation.subjectRequired).max(200),
    content: z
      .string()
      .min(1, validation.messageRequired)
      .min(10, validation.messageMinLength)
      .max(5000),
  });
}

// Shared shape between the public contact form and the POST /api/contact endpoint.
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Please enter a valid email address").max(254),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  content: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Server-side payload accepted by POST /api/contact (adds the CAPTCHA token).
// captchaToken tetap optional di skema; server menolak token kosong hanya saat captcha aktif (verifyTurnstile).
export const contactApiSchema = contactFormSchema.extend({
  captchaToken: z.string().optional(),
});

export type ContactApiValues = z.infer<typeof contactApiSchema>;
