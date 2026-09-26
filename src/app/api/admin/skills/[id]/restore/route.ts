import prisma from "@/lib/prisma";
import { trashedOnly } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "restore:skill");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.skill.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      return errorResponse("Skill not found in trash", 404);
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: { deletedAt: null },
    });

    return successResponse(skill);
  } catch (error) {
    return errorResponseFrom(error, "Skill operation failed");
  }
}
