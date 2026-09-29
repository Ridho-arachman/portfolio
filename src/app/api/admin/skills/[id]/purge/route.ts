import prisma from "@/lib/prisma";
import { trashedOnly } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { getClientIp } from "@/utils/client-ip";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let actorId: string | undefined;
  let entityId: string | undefined;
  let ip: string | undefined;
  try {
    const { id } = await params;
    entityId = id;
    ip = getClientIp(req.headers);
    const session = await requireAdminSession({ ip, action: "purge:skill", entityId: id });
    actorId = session.user.id;
    const rate = await applyRateLimit("userAction", session.user.id, "purge:skill");
    if (!rate.allowed) {
      logSecurityEvent({ action: "purge:skill", actorId, entityId: id, ip, ok: false });
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      logSecurityEvent({ action: "purge:skill", actorId, entityId: id, ip, ok: false });
      return errorResponse("confirm=true is required to permanently delete", 400);
    }

    const existing = await prisma.skill.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      logSecurityEvent({ action: "purge:skill", actorId, entityId: id, ip, ok: false });
      return errorResponse("Skill not found in trash", 404);
    }

    await prisma.skill.delete({ where: { id } });

    logSecurityEvent({ action: "purge:skill", actorId, entityId: id, ip, ok: true });
    return successResponse({ message: "Skill permanently deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponseFrom(error, "Skill operation failed");
    }
    logSecurityEvent({ action: "purge:skill", actorId, entityId, ip, ok: false });
    return errorResponseFrom(error, "Skill operation failed");
  }
}
