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
  googleLabel: "Google",
  githubLabel: "GitHub",
  orLabel: "atau",
  emailLabel: "Email",
  emailPlaceholder: "admin@ridho.dev",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  forgotLabel: "Lupa password?",
  forgotNote:
    "Fitur lupa password belum tersedia. Hubungi administrator.",
  signInLabel: "Sign In",
  signingInLabel: "Signing in...",
  errorGeneric: "Login gagal. Coba lagi.",
  errorCaptcha: "Verifikasi CAPTCHA gagal. Coba lagi.",
  errorCaptchaRequired: "Selesaikan verifikasi CAPTCHA terlebih dahulu.",
  errorRateLimit:
    "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
  errorInvalidCredentials: "Email atau password salah.",
  errorSocial: "Login sosial gagal. Coba lagi.",
  errorForbidden: "Akun tidak memiliki akses admin.",
  footerNote: "Ridho.dev Admin",
} as const;
