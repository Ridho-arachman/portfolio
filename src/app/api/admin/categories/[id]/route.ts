import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { notDeleted, slugReserved } from "@/lib/soft-delete";
import { slugify } from "@/utils/slug";
import { categoryUpdateSchema } from "@/schema/category";
import { CATEGORY_TRANSLATABLE_FIELDS } from "@/schema/content-translations";
import {
  translatableBase,
  withAutoIdTranslations,
} from "@/lib/content-i18n";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const category = await prisma.category.findUnique({ where: { id, ...notDeleted } });

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    return successResponse(category);
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:category");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = categoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.category.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.name ? slugify(data.name) : undefined);

    // Auto-fill blank Indonesian overrides; translator failure keeps blanks.
    // Only when the translations key is present: an absent key leaves the
    // stored column untouched so existing manual overrides are never lost.
    const translations =
      data.translations !== undefined
        ? await withAutoIdTranslations(
            translatableBase(
              { ...existing, ...data },
              CATEGORY_TRANSLATABLE_FIELDS,
            ),
            data.translations,
            CATEGORY_TRANSLATABLE_FIELDS,
          )
        : undefined;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(slug !== undefined && { slug }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.order !== undefined && { order: data.order }),
        // Spread seperti di POST: aman terhadap client yang belum di-generate ulang.
        ...(data.translations !== undefined && {
          translations: translations ?? Prisma.DbNull,
        }),
      },
    });

    revalidateTag("categories", { expire: 0 });

    return successResponse(category);
  } catch (error) {
    return errorResponseFrom(
      error,
      "Category operation failed",
      slugReserved("Category"),
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:category");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateTag("categories", { expire: 0 });

    return successResponse({ message: "Category moved to trash" });
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}
