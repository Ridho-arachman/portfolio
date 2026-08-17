// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { captchaPlugin } from "./auth-captcha";

const getNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  // Registrasi kolom ekstra `role` agar terbaca & ter-typings di session.
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["email-password", "google", "github"],
    },
  },

  // Social login (env-gated: baru aktif saat kredensial diisi).
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // Sesi: DB session (refresh, 7 hari) + JWT access cookie (~15 menit).
  session: {
    expiresIn: 60 * 60 * 24 * 7, // refresh token / session DB
    updateAge: 60 * 60 * 24, // rotasi session tiap 1 hari
    cookieCache: {
      enabled: true,
      maxAge: 15 * 60, // access token (detik)
      strategy: "jwt",
    },
  },

  // Rate limiting berbasis database (Postgres), tanpa Redis.
  rateLimit: {
    enabled: process.env.DISABLE_RATE_LIMIT !== "true",
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: getNumber(process.env.AUTH_RATE_LIMIT_SIGNIN_MAX, 5),
      },
      "/sign-up/email": {
        window: 60 * 60,
        max: getNumber(process.env.AUTH_RATE_LIMIT_SIGNUP_MAX, 5),
      },
      "/sign-in/social": {
        window: 60,
        max: 10,
      },
    },
  },

  plugins: [captchaPlugin()],
});
