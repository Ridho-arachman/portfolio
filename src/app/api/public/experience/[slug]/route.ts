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

    const experience = await prisma.experience.findFirst({
      where: { slug, isPublished: true, ...notDeleted },
      select: {
        id: true,
        slug: true,
        title: true,
        company: true,
        logoUrl: true,
        thumbnail: true,
        type: true,
        location: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        description: true,
        gallery: true,
        isPublished: true,
      },
    });

    if (!experience) {
      return errorResponse("Not found", 404);
    }

    return successResponse(experience);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
