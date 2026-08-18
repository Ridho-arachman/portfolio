import { z } from "zod/v4";

const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().default("Ridho.dev"),
  NEXT_PUBLIC_SITE_TAGLINE: z.string().default("Web3 Portfolio"),
  NEXT_PUBLIC_SITE_URL: z.string().default("https://aromatically-dreamiest-delia.ngrok-free.dev"),
  NEXT_PUBLIC_SITE_DESCRIPTION: z.string().default("Information Systems student crafting immersive web experiences with modern tech stack."),

  NEXT_PUBLIC_AUTHOR_NAME: z.string().default("Ridho Arachman"),
  NEXT_PUBLIC_AUTHOR_TITLE: z.string().default("Web Developer"),
  NEXT_PUBLIC_AUTHOR_BIO: z.string().default("Recent Information Systems graduate with a deep passion for crafting immersive, high-performance, and user-centric web experiences."),

  NEXT_PUBLIC_CONTACT_EMAIL: z.string().default("ridho@example.com"),
  NEXT_PUBLIC_LOCATION: z.string().default("Indonesia (Remote-ready)"),

  NEXT_PUBLIC_GITHUB_URL: z.string().default("https://github.com/Ridho-arachman"),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().default("https://linkedin.com/in/ridho-arachman"),
  NEXT_PUBLIC_TWITTER_URL: z.string().default("https://twitter.com/ridho_arachman"),

  NEXT_PUBLIC_MAP_TILE_URL: z.string().default("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"),
  NEXT_PUBLIC_NGROK_DOMAIN: z.string().optional(),

  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().optional(),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedClientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;

  const parsed = clientEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid client environment variables:\n${issues}`);
  }
  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  BETTER_AUTH_SECRET: isTest ? z.string().optional() : z.string().min(32),
  BETTER_AUTH_URL: isTest ? z.string().optional() : z.url(),

  TURNSTILE_SECRET_KEY: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),

  AUTH_RATE_LIMIT_SIGNIN_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RATE_LIMIT_SIGNUP_MAX: z.coerce.number().int().positive().default(5),
  DISABLE_RATE_LIMIT: z.coerce.boolean().default(false),

  DATABASE_URL: isTest ? z.string().optional() : z.url(),

  ...clientEnvSchema.shape,
});

export type Env = z.infer<typeof serverEnvSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}