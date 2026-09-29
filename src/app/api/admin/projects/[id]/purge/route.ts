import { revalidatePath, revalidateTag } from "next/cache";
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
    const session = await requireAdminSession({ ip, action: "purge:project", entityId: id });
    actorId = session.user.id;
    const rate = await applyRateLimit("userAction", session.user.id, "purge:project");
    if (!rate.allowed) {
      logSecurityEvent({ action: "purge:project", actorId, entityId: id, ip, ok: false });
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    // `?confirm=true` wajib: purge adalah satu-satunya operasi yang menghapus
    // baris beserta seluruh isinya, jadi klik tanpa sengaja tidak boleh
    // sampai ke database.
    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      logSecurityEvent({ action: "purge:project", actorId, entityId: id, ip, ok: false });
      return errorResponse("confirm=true is required to permanently delete", 400);
    }

    const existing = await prisma.project.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      logSecurityEvent({ action: "purge:project", actorId, entityId: id, ip, ok: false });
      return errorResponse("Project not found in trash", 404);
    }

    await prisma.project.delete({ where: { id } });

    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidateTag("projects", { expire: 0 });

    logSecurityEvent({ action: "purge:project", actorId, entityId: id, ip, ok: true });
    return successResponse({ message: "Project permanently deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponseFrom(error, "Project operation failed");
    }
    logSecurityEvent({ action: "purge:project", actorId, entityId, ip, ok: false });
    return errorResponseFrom(error, "Project operation failed");
  }
}
