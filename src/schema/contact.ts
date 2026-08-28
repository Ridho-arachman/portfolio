import { z } from "zod";

// Shared shape between the public contact form and the POST /api/contact endpoint.
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Server-side payload accepted by POST /api/contact (adds the CAPTCHA token).
export const contactApiSchema = contactFormSchema.extend({
  captchaToken: z.string().optional(),
});

export type ContactApiValues = z.infer<typeof contactApiSchema>;
