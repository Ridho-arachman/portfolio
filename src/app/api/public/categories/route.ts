import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { successResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: notDeleted,
      orderBy: { order: "asc" },
    });

    return successResponse(categories);
  } catch {
    return successResponse([], 500);
  }
}
