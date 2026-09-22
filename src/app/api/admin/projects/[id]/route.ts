import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slug";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";
import { projectUpdateSchema } from "@/schema/project";

export const dynamic = "force-dynamic";

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

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.title ? slugify(data.title) : undefined);

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

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    if (project.slug !== existing.slug) {
      revalidatePath(`/projects/${existing.slug}`);
    }
    revalidateTag("projects", { expire: 0 });

    return successResponse(project);
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
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

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    await prisma.project.delete({ where: { id } });

    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidateTag("projects", { expire: 0 });

    return successResponse({ message: "Project deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}
