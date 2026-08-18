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

const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  description: z.string().min(10).optional(),
  thumbnail: z.string().url().optional(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  role: z.string().optional(),
  year: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
  categoryId: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    return successResponse(project);
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
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.title ? generateSlug(data.title) : undefined);

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
          categoryId: data.categoryId || null,
        }),
      },
    });

    return successResponse(project);
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

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    await prisma.project.delete({ where: { id } });

    return successResponse({ message: "Project deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
