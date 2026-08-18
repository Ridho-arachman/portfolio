import prisma from "@/lib/prisma";
import { successResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    return successResponse(categories);
  } catch {
    return successResponse([], 500);
  }
}
