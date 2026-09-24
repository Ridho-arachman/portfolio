// Environment loading with per-process caching.
// Schema definitions live in @/schema/env (project convention: zod -> /schema).
import {
  clientEnvSchema,
  serverEnvSchema,
  type ClientEnv,
  type Env,
} from "@/schema/env";

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

export const env = getEnv();
