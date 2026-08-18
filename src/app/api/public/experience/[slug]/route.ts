import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const experience = await prisma.experience.findFirst({
      where: { slug },
    });

    if (!experience) {
      return errorResponse("Not found", 404);
    }

    return successResponse(experience);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
