import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { notDeleted, slugReserved } from "@/lib/soft-delete";
import { slugify } from "@/utils/slug";
import { certificateUpdateSchema } from "@/schema/certificate";
import { CERTIFICATE_TRANSLATABLE_FIELDS } from "@/schema/content-translations";
import {
  translatableBase,
  withAutoIdTranslations,
} from "@/lib/content-i18n";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";
import { findUnknownRelationMessage } from "@/lib/relation-ids";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id, ...notDeleted },
      // `set` pada relasi m-n mengganti SELURUH tautan, jadi prefill form
      // harus ikut memuat entitas yang sudah di-trash — memfilternya di sini
      // membuat setiap penyimpanan diam-diam membuang tautan itu.
      include: {
        projects: { select: { id: true, title: true } },
        experiences: { select: { id: true, title: true } },
      },
    });

    if (!certificate) {
      return errorResponse("Certificate not found", 404);
    }

    return successResponse(certificate);
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:certificate");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = certificateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.certificate.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Certificate not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.title ? slugify(data.title) : undefined);

    const unknownRelation = await findUnknownRelationMessage([
      { label: "project", model: "project", ids: data.projectIds },
      { label: "experience", model: "experience", ids: data.experienceIds },
    ]);
    if (unknownRelation) {
      return errorResponse(unknownRelation, 400);
    }

    // Auto-fill blank Indonesian overrides; translator failure keeps blanks.
    // Only when the translations key is present: an absent key leaves the
    // stored column untouched so existing manual overrides are never lost.
    const translations =
      data.translations !== undefined
        ? await withAutoIdTranslations(
            translatableBase(
              { ...existing, ...data },
              CERTIFICATE_TRANSLATABLE_FIELDS,
            ),
            data.translations,
            CERTIFICATE_TRANSLATABLE_FIELDS,
          )
        : undefined;

    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.issuer !== undefined && { issuer: data.issuer }),
        ...(data.thumbnail !== undefined && {
          thumbnail: data.thumbnail || null,
        }),
        ...(data.gallery !== undefined && { gallery: data.gallery }),
        ...(data.credentialId !== undefined && {
          credentialId: data.credentialId || null,
        }),
        ...(data.credentialUrl !== undefined && {
          credentialUrl: data.credentialUrl || null,
        }),
        ...(data.issueDate !== undefined && {
          issueDate: new Date(data.issueDate),
        }),
        ...(data.expiryDate !== undefined && {
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        }),
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.projectIds !== undefined && {
          projects: { set: data.projectIds.map((id) => ({ id })) },
        }),
        ...(data.experienceIds !== undefined && {
          experiences: { set: data.experienceIds.map((id) => ({ id })) },
        }),
        ...(data.translations !== undefined && {
          translations: translations ?? Prisma.DbNull,
        }),
      },
    });

    revalidatePath("/certificates");
    revalidatePath(`/certificates/${certificate.slug}`);
    revalidateTag("certificates", { expire: 0 });

    return successResponse(certificate);
  } catch (error) {
    return errorResponseFrom(
      error,
      "Certificate operation failed",
      slugReserved("Certificate"),
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:certificate");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.certificate.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Certificate not found", 404);
    }

    await prisma.certificate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/certificates");
    revalidatePath(`/certificates/${existing.slug}`);
    revalidateTag("certificates", { expire: 0 });

    return successResponse({ message: "Certificate moved to trash" });
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}
