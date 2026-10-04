import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { notDeleted, slugReserved } from "@/lib/soft-delete";
import { slugify } from "@/utils/slug";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";
import { findUnknownRelationMessage } from "@/lib/relation-ids";
import { projectUpdateSchema } from "@/schema/project";
import { PROJECT_TRANSLATABLE_FIELDS } from "@/schema/content-translations";
import {
  translatableBase,
  withAutoIdTranslations,
} from "@/lib/content-i18n";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id, ...notDeleted },
      // Jangan kembali ke `include: { category: true }`: itu menarik `deletedAt`
      // ke respons. Insiden 86d09b0.
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            order: true,
          },
        },
        // Dipakai form admin untuk prefill multi-select. Select ini tetap
        // membaca baris di-trash: `set` pada relasi m-n mengganti SELURUH
        // tautan, jadi tautan ke entitas yang sudah di-trash harus tetap ikut
        // terkirim atau hilang diam-diam setiap kali form disimpan.
        certificates: { select: { id: true, title: true } },
        experiences: { select: { id: true, title: true } },
      },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    return successResponse(project);
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:project");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.project.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.title ? slugify(data.title) : undefined);

    const unknownRelation = await findUnknownRelationMessage([
      {
        label: "category",
        model: "category",
        ids: data.categoryId === undefined ? undefined : [data.categoryId],
      },
      { label: "certificate", model: "certificate", ids: data.certificateIds },
      { label: "experience", model: "experience", ids: data.experienceIds },
    ]);
    if (unknownRelation) {
      return errorResponse(unknownRelation, 400);
    }

    // Auto-fill blank Indonesian overrides; translator failure keeps blanks.
    // Only when the translations key is present: an absent key leaves the
    // stored column untouched so existing manual overrides are never lost.
    // Base falls back to the stored row for fields missing in partial updates.
    const translations =
      data.translations !== undefined
        ? await withAutoIdTranslations(
            translatableBase(
              { ...existing, ...data },
              PROJECT_TRANSLATABLE_FIELDS,
            ),
            data.translations,
            PROJECT_TRANSLATABLE_FIELDS,
          )
        : undefined;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(slug !== undefined && { slug }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl || null }),
        ...(data.repoUrl !== undefined && { repoUrl: data.repoUrl || null }),
        ...(data.npmUrl !== undefined && { npmUrl: data.npmUrl || null }),
        ...(data.technologies !== undefined && {
          technologies: data.technologies,
        }),
        ...(data.gallery !== undefined && { gallery: data.gallery }),
        ...(data.role !== undefined && { role: data.role || null }),
        ...(data.year !== undefined && { year: data.year || null }),
        ...(data.highlights !== undefined && { highlights: data.highlights }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.categoryId !== undefined && {
          categoryId: data.categoryId,
        }),
        ...(data.certificateIds !== undefined && {
          certificates: {
            set: data.certificateIds.map((id) => ({ id })),
          },
        }),
        ...(data.experienceIds !== undefined && {
          experiences: {
            set: data.experienceIds.map((id) => ({ id })),
          },
        }),
        ...(data.translations !== undefined && {
          translations: translations ?? Prisma.DbNull,
        }),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    if (project.slug !== existing.slug) {
      revalidatePath(`/projects/${existing.slug}`);
    }
    revalidateTag("projects", { expire: 0 });

    return successResponse(project);
  } catch (error) {
    return errorResponseFrom(
      error,
      "Project operation failed",
      slugReserved("Project"),
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:project");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.project.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    // Soft delete: baris tetap ada supaya bisa di-restore atau di-purge dari
    // trash, dan slug-nya tetap terikat sampai salah satu dilakukan.
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidateTag("projects", { expire: 0 });

    return successResponse({ message: "Project moved to trash" });
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}
