import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
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
    const updateData: Record<string, unknown> = { ...data };

    if (data.slug) updateData.slug = data.slug;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    const experience = await prisma.experience.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/experience");
    revalidatePath(`/experience/${experience.slug}`);
    revalidateTag("experiences", { expire: 0 });

    return successResponse(experience);
  } catch (error) {
    return errorResponseFrom(error, "Experience operation failed");
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

    await prisma.experience.delete({ where: { id } });

    revalidatePath("/experience");
    revalidatePath(`/experience/${existing.slug}`);
    revalidateTag("experiences", { expire: 0 });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponseFrom(error, "Experience operation failed");
  }
}