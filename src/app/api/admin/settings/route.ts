import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getSiteSettings, SITE_SETTINGS_ID, SITE_SETTINGS_SELECT } from "@/lib/settings";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";
import { settingsUpdateSchema } from "@/schema/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();

    // Hasil resolve, bukan baris mentah: form admin harus selalu menampilkan
    // nilai efektif, tidak pernah string kosong dari kolom yang null.
    return successResponse(await getSiteSettings());
  } catch (error) {
    return errorResponseFrom(error, "Site settings operation failed");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:settings");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const parsed = settingsUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { profile, socials, site, quickLinks } = parsed.data;

    // Nama field grup = nama kolom (lihat schema/settings.ts), jadi tidak ada
    // peta rename. Prisma mengabaikan key bernilai `undefined`, jadi hanya grup
    // yang dikirim yang tersentuh; mengembalikan nilai ke env lewat /reset.
    const columns = {
      ...profile,
      ...socials,
      ...site,
      ...(quickLinks && { quickLinks }),
    };

    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: columns,
      update: columns,
      select: SITE_SETTINGS_SELECT,
    });

    // Cukup satu tag: `composePublicContent` dijalankan per request di layout
    // publik di atas `getSiteSettings`, jadi tidak ada turunan settings yang
    // tersimpan di dalam entri cache `translations`.
    revalidateTag("site-settings", { expire: 0 });

    return successResponse(await getSiteSettings());
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Baris singleton ganda: secara teori mustahil karena upsert by id, tapi
      // 409 yang jelas lebih berguna daripada 500.
      return errorResponse("Site settings singleton already exists", 409);
    }
    return errorResponseFrom(error, "Site settings operation failed");
  }
}
