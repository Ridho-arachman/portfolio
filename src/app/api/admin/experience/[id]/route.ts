import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { notDeleted, slugReserved } from "@/lib/soft-delete";
import { experienceUpdateSchema } from "@/schema/experience";
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

    const experience = await prisma.experience.findUnique({ where: { id, ...notDeleted } });

    if (!experience) {
      return errorResponse("Experience not found", 404);
    }

    return successResponse(experience);
  } catch (error) {
    return errorResponseFrom(error, "Experience operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:experience");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const json = await req.json();
    const parsed = experienceUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400);
    }

    const data = parsed.data;

    const existing = await prisma.experience.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Experience not found", 404);
    }

    const experience = await prisma.experience.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.startDate !== undefined && {
          startDate: new Date(data.startDate),
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.gallery !== undefined && { gallery: data.gallery }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.translations !== undefined && {
          translations: data.translations ?? Prisma.DbNull,
        }),
      },
    });

    revalidatePath("/experience");
    revalidatePath(`/experience/${experience.slug}`);
    revalidateTag("experiences", { expire: 0 });

    return successResponse(experience);
  } catch (error) {
    return errorResponseFrom(
      error,
      "Experience operation failed",
      slugReserved("Experience"),
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:experience");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.experience.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Experience not found", 404);
    }

    await prisma.experience.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/experience");
    revalidatePath(`/experience/${existing.slug}`);
    revalidateTag("experiences", { expire: 0 });

    return successResponse({ message: "Experience moved to trash" });
  } catch (error) {
    return errorResponseFrom(error, "Experience operation failed");
  }
}