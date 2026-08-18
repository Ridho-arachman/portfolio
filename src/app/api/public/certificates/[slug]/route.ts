import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: { slug, isPublished: true },
    });

    if (!certificate) {
      return errorResponse("Not found", 404);
    }

    return successResponse(certificate);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
