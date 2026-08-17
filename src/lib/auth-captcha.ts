// lib/auth-captcha.ts
// Plugin better-auth yang memverifikasi token Turnstile sebelum
// request sign-in/sign-up email diproses.
import type { BetterAuthPlugin } from "better-auth";
import { verifyTurnstile } from "./turnstile";

const CAPTCHA_PATHS = ["/sign-in/email", "/sign-up/email"];

export function captchaPlugin(): BetterAuthPlugin {
  return {
    id: "turnstile-captcha",
    hooks: {
      before: [
        {
          matcher: (context) =>
            context.path ? CAPTCHA_PATHS.includes(context.path) : false,
          handler: async (context) => {
            const body = context.body as { captchaToken?: string } | undefined;
            const token = body?.captchaToken;

            const valid = await verifyTurnstile(token);
            if (!valid) {
              return {
                response: Response.json(
                  { error: "CAPTCHA_VERIFICATION_FAILED" },
                  { status: 400 },
                ),
              } as never;
            }
          },
        },
      ],
    },
  };
}
