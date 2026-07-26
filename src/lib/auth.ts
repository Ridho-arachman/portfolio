// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Aktifkan login dengan Email & Password
  emailAndPassword: {
    enabled: true,
    // Opsional: Aktifkan fitur lupa password nanti
    // requireEmailVerification: false,
  },

  // Opsional: Siapkan placeholder untuk OAuth (GitHub/Google) di masa depan
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
