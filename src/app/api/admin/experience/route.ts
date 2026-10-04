import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { notDeleted, trashedOnly, slugReserved } from "@/lib/soft-delete";
import { slugify } from "@/utils/slug";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination, errorResponseFrom } from "@/lib/api-helpers";
import { findUnknownRelationMessage } from "@/lib/relation-ids";
import { experienceCreateSchema } from "@/schema/experience";
import { EXPERIENCE_TRANSLATABLE_FIELDS } from "@/schema/content-translations";
import {
  translatableBase,
  withAutoIdTranslations,
} from "@/lib/content-i18n";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);
    const trashed = searchParams.get("trashed") === "true";

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { company: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(trashed ? trashedOnly : notDeleted),
    };

    const [data, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.experience.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return paginatedResponse(data, { page, pageSize, total, totalPages });
  } catch (error) {
    return errorResponseFrom(error, "Experience operation failed");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "create:experience");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const json = await req.json();
    const parsed = experienceCreateSchema.safeParse(json);

    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400);
    }

    const data = parsed.data;
    const slug = data.slug ?? slugify(data.title);

    const unknownRelation = await findUnknownRelationMessage([
      { label: "project", model: "project", ids: data.projectIds },
      { label: "certificate", model: "certificate", ids: data.certificateIds },
    ]);
    if (unknownRelation) {
      return errorResponse(unknownRelation, 400);
    }

    // Auto-fill blank Indonesian overrides; translator failure keeps blanks.
    const translations = await withAutoIdTranslations(
      translatableBase({ ...data }, EXPERIENCE_TRANSLATABLE_FIELDS),
      data.translations,
      EXPERIENCE_TRANSLATABLE_FIELDS,
    );

    // `projectIds`/`certificateIds` bukan kolom, jadi harus dilepas dari spread
    // sebelum masuk ke Prisma — memberikannya sebagai key data akan ditolak
    // runtime sebagai unknown arg.
    const { projectIds, certificateIds, ...columns } = data;

    const experience = await prisma.experience.create({
      data: {
        ...columns,
        slug,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description ?? [],
        gallery: data.gallery ?? [],
        translations: translations ?? undefined,
        ...(projectIds !== undefined && {
          projects: { connect: projectIds.map((id) => ({ id })) },
        }),
        ...(certificateIds !== undefined && {
          certificates: {
            connect: certificateIds.map((id) => ({ id })),
          },
        }),
      },
    });

    revalidatePath("/experience");
    revalidatePath(`/experience/${experience.slug}`);
    revalidateTag("experiences", { expire: 0 });

    return successResponse(experience, 201);
  } catch (error) {
    return errorResponseFrom(
      error,
      "Experience operation failed",
      slugReserved("Experience"),
    );
  }
}