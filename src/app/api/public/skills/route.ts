import prisma from "@/lib/prisma";
import { successResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    return successResponse(skills);
  } catch {
    return successResponse([], 500);
  }
}
