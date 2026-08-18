import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const updateExperienceSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3).optional(),
  company: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  type: z.enum(["WORK", "ORGANIZATION", "FREELANCE", "EDUCATION", "CERTIFICATION"]).optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  description: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const experience = await prisma.experience.findUnique({ where: { id } });

    if (!experience) {
      return errorResponse("Experience not found", 404);
    }

    return successResponse(experience);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const json = await req.json();
    const parsed = updateExperienceSchema.safeParse(json);

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

    return successResponse(experience);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    await prisma.experience.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}