import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const socialsSchema = z.object({
  github: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  linkedin: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  x: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  email: z
    .union([z.email("Enter a valid email address"), z.literal("")])
    .optional(),
});

export type SocialsFormValues = z.infer<typeof socialsSchema>;

export const siteSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  tagline: z.string().min(2, "Tagline must be at least 2 characters"),
});

export type SiteFormValues = z.infer<typeof siteSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;
