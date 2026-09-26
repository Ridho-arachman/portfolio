import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { successResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      where: notDeleted,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    return successResponse(skills);
  } catch {
    return successResponse([], 500);
  }
}
