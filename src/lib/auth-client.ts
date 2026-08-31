// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

// Selalu pakai relative URL (empty string) supaya request selalu same-origin.
// Hindari NEXT_PUBLIC_BETTER_AUTH_URL karena:
// 1. Vercel punya banyak alias URL (production, preview, alias)
// 2. CSP connect-src 'self' nge-block cross-origin requests
// 3. baseURL berbeda dari current domain = auth gagal
export const authClient = createAuthClient({
  baseURL: "",
});

// Ekstrak langsung hook dan fungsinya dari authClient
export const { signIn, signUp, signOut, useSession } = authClient;
