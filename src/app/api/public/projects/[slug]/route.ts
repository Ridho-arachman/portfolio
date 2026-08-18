import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const project = await prisma.project.findFirst({
      where: { slug, isPublished: true },
      include: { category: true },
    });

    if (!project) {
      return errorResponse("Not found", 404);
    }

    return successResponse(project);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
