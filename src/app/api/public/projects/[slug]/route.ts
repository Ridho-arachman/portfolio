import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const project = await prisma.project.findFirst({
      where: { slug, isPublished: true, ...notDeleted },
      // Select eksplisit: `select: true`/`include` penuh menarik kolom internal
      // (`deletedAt`, `order`, `createdAt`, `updatedAt`) ke respons. Insiden 86d09b0.
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        liveUrl: true,
        repoUrl: true,
        npmUrl: true,
        technologies: true,
        gallery: true,
        role: true,
        year: true,
        highlights: true,
        isPublished: true,
        categoryId: true,
        category: {
          where: notDeleted,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!project) {
      return errorResponse("Not found", 404);
    }

    return successResponse(project);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
