import { revalidateTag } from "next/cache";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { LOCALES } from "@/lib/i18n";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const translationsResetSchema = z
  .object({ locale: z.enum(LOCALES).optional() })
  .default({});

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "reset:translations");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    let body: unknown = {};
    const raw = await req.text();
    if (raw.length > 0) {
      try {
        body = JSON.parse(raw);
      } catch {
        return errorResponse("Body must be valid JSON", 400);
      }
    }

    const parsed = translationsResetSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    if (parsed.data.locale) {
      await prisma.translation.deleteMany({ where: { locale: parsed.data.locale } });
    } else {
      await prisma.translation.deleteMany();
    }

    revalidateTag("translations", { expire: 0 });

    return successResponse({ reset: parsed.data.locale ?? "all" });
  } catch (error) {
    return errorResponseFrom(error, "Translation operation failed");
  }
}
