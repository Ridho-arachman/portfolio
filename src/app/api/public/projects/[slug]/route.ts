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
      // `include: { category: true }` menarik `deletedAt` ke respons. Insiden 86d09b0.
      include: {
        category: {
          where: notDeleted,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            order: true,
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
