import prisma from "@/lib/prisma";
import { trashedOnly } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "purge:skill");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      return errorResponse("confirm=true is required to permanently delete", 400);
    }

    const existing = await prisma.skill.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      return errorResponse("Skill not found in trash", 404);
    }

    await prisma.skill.delete({ where: { id } });

    return successResponse({ message: "Skill permanently deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Skill operation failed");
  }
}
