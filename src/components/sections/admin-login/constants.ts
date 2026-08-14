import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const ADMIN_LOGIN = {
  badgeLabel: "Admin Access",
  title: "Welcome Back",
  subtitle: "Sign in to access the admin dashboard.",
  emailLabel: "Email",
  emailPlaceholder: "admin@ridho.dev",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  rememberLabel: "Remember me for 30 days",
  forgotLabel: "Forgot password?",
  forgotNote:
    "Fitur lupa password belum tersedia (mockup). Hubungi administrator.",
  signInLabel: "Sign In",
  signingInLabel: "Signing in...",
  successTitle: "Login berhasil!",
  successNote: "Mockup — autentikasi backend menyusul.",
  successBackLabel: "Kembali ke Beranda",
  footerNote: "Ridho.dev Admin",
} as const;
