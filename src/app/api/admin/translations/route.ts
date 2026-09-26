import { revalidateTag } from "next/cache";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { LOCALES, isValidLocale, type Locale } from "@/lib/i18n";
import { resolveMessages, translationPatchSchema } from "@/lib/translations";
import type { Messages } from "@/lib/translation-types";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";

export const dynamic = "force-dynamic";

const bundled: Record<Locale, Messages> = {
  en: enMessages,
  id: idMessages,
};

/**
 * Patch tersimpan bisa saja rusak atau key-nya sudah dihapus dari dokumen
 * bawaan. `getMessages` sudah menelan error itu demi halaman publik, tapi
 * endpoint ini tidak boleh 500 hanya karena satu baris rusak.
 */
function safeResolve(locale: Locale, patch: Record<string, string> | null): Messages {
  try {
    return resolveMessages(bundled[locale], patch);
  } catch {
    return bundled[locale];
  }
}

export async function GET() {
  try {
    await requireAdminSession();

    const rows = await prisma.translation.findMany({ select: { locale: true, values: true } });

    const locales = LOCALES.map((locale) => {
      // Parse ulang dengan schema yang sama seperti body PUT: aturan "patch =
      // datar, nilai = string" hanya perlu didefinisikan sekali.
      const parsed = translationPatchSchema.shape.values.safeParse(
        rows.find((row) => row.locale === locale)?.values,
      );

      return {
        locale,
        // `messages`: yang benar-benar dirender situs publik setelah patch.
        messages: safeResolve(locale, parsed.success ? parsed.data : null),
        // `patch`: key yang benar-benar tersimpan. Editor butuh bedanya dari
        // key yang diwarisi dari dokumen bawaan supaya bisa menampilkannya
        // read-only, bukan menyiratkan semua key itu tersimpan.
        patch: parsed.success ? parsed.data : {},
      };
    });

    return successResponse(locales);
  } catch (error) {
    return errorResponseFrom(error, "Translation operation failed");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:translations");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    // Locale lewat query param, bukan body: body tetap persis
    // `translationPatchSchema` yang juga dipakai `getMessages` untuk mem-parse
    // baris DB, jadi bentuk patch hanya didefinisikan di satu tempat, dan satu
    // dokumen = satu URL.
    const locale = new URL(req.url).searchParams.get("locale");
    if (!locale || !isValidLocale(locale)) {
      return errorResponse(`Unsupported locale, expected one of: ${LOCALES.join(", ")}`, 400);
    }

    const parsed = translationPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const patch = parsed.data.values;

    // Validasi ke dokumen bawaan SEBELUM menulis: `resolveMessages` melempar
    // ZodError untuk key yang tidak ada di dokumen, dan itu kesalahan input
    // yang harus 400 — bukan 500, dan tidak boleh menyentuh DB.
    let messages: Messages;
    try {
      messages = resolveMessages(bundled[locale], patch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(error.issues[0].message, 400);
      }
      throw error;
    }

    // PUT = ganti patch, bukan merge: editor sudah menerima `patch` mentah dari
    // GET dan mengirimkannya utuh, jadi ia juga bisa menghapus override dengan
    // tidak mengirim key itu.
    await prisma.translation.upsert({
      where: { locale },
      create: { locale, values: patch },
      update: { values: patch },
    });

    revalidateTag("translations", { expire: 0 });

    return successResponse({ locale, messages, patch });
  } catch (error) {
    return errorResponseFrom(error, "Translation operation failed");
  }
}
