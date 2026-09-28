// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

const SESSION_COOKIES = ["better-auth.session_token", "better-auth.session_data"];

// Cocok dengan nama cookie apa pun, termasuk yang ber-prefix `__Secure-`/`__Host-`.
const isSessionCookie = (cookie: string) => {
  const name = cookie.slice(0, cookie.indexOf("=")).toLowerCase();
  return SESSION_COOKIES.some((suffix) => name.endsWith(suffix));
};

// Ubah cookie sesi jadi session-cookie (buang Max-Age/Expires) supaya hilang
// saat browser ditutup. `signInEmail` sudah bisa lewat `rememberMe`, tapi
// `signInSocial`/callback OAuth tidak punya opsi itu, jadi dibentuk di level
// response agar semua jalur login konsisten.
const toSessionCookies = (response: Response): Response => {
  const cookies = response.headers.getSetCookie();
  if (!cookies.some(isSessionCookie)) return response;

  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append(
      "set-cookie",
      isSessionCookie(cookie)
        ? cookie.replace(/;\s*(?:max-age|expires)=[^;]*/gi, "")
        : cookie,
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const handler = async (request: NextRequest) =>
  toSessionCookies(await auth.handler(request));

// Better Auth menangani semua method (GET, POST, dll) melalui handler ini
export const GET = handler;
export const POST = handler;
