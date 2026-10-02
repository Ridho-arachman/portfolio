import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  clearSettingsTranslationFields,
  DEFAULT_QUICK_LINK_KEYS,
  getAdminSettings,
  SITE_SETTINGS_ID,
  type SiteSettingsTranslatableField,
} from "@/lib/settings";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";
import { settingsResetSchema, SETTINGS_SECTIONS, type SettingsSection } from "@/schema/settings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "reset:settings");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      return errorResponse("confirm=true is required to reset settings", 400);
    }

    // Body opsional: `{}` (atau tanpa body) berarti reset semua. JSON rusak
    // ditolak 400, bukan diam-diam jadi reset semua di endpoint destruktif.
    let body: unknown = {};
    const raw = await req.text();
    if (raw.length > 0) {
      try {
        body = JSON.parse(raw);
      } catch {
        return errorResponse("Body must be valid JSON", 400);
      }
    }

    const parsed = settingsResetSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const sections = new Set<SettingsSection>(
      parsed.data.section ? [parsed.data.section] : SETTINGS_SECTIONS,
    );

    // Reset berarti null-kan kolom nilai, bukan menghapus data: `resolveSiteSettings`
    // membaca null sebagai "belum di-override" lalu jatuh ke env. Baris settings
    // sengaja nullable persis untuk state "fall back ke env" ini, jadi unset
    // tidak butuh backup nilai lama. Kolom quickLinks tidak nullable, jadi
    // reset-nya mengembalikan enam nav key kanonik. Override translations milik
    // section ikut dibuang supaya ID kembali mewarisi base.
    const PROFILE_TRANSLATABLE: readonly SiteSettingsTranslatableField[] = [
      "bio",
      "jobTitle",
      "location",
    ];
    const SITE_TRANSLATABLE: readonly SiteSettingsTranslatableField[] = [
      "tagline",
      "siteDescription",
    ];
    const dropped = [
      ...(sections.has("profile") ? PROFILE_TRANSLATABLE : []),
      ...(sections.has("site") ? SITE_TRANSLATABLE : []),
    ];
    const stored = dropped.length > 0
      ? await prisma.siteSettings.findUnique({
        where: { id: SITE_SETTINGS_ID },
        select: { translations: true },
      })
      : null;
    const data = {
      ...(sections.has("profile") && {
        fullName: null,
        jobTitle: null,
        bio: null,
        location: null,
        contactEmail: null,
      }),
      ...(sections.has("socials") && {
        githubUrl: null,
        linkedinUrl: null,
        twitterUrl: null,
        instagramUrl: null,
      }),
      ...(sections.has("site") && {
        siteName: null,
        tagline: null,
        siteUrl: null,
        siteDescription: null,
      }),
      ...(sections.has("quickLinks") && { quickLinks: [...DEFAULT_QUICK_LINK_KEYS] }),
      ...(dropped.length > 0 && {
        translations:
          clearSettingsTranslationFields(stored?.translations, dropped) ?? Prisma.DbNull,
      }),
    };

    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: data,
      update: data,
    });

    revalidateTag("site-settings", { expire: 0 });

    return successResponse(await getAdminSettings());
  } catch (error) {
    return errorResponseFrom(error, "Site settings operation failed");
  }
}
