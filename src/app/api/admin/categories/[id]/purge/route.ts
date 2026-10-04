import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { trashedOnly } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { getClientIp } from "@/utils/client-ip";
import { successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

// `Project.categoryId` = Restrict, jadi hard delete kategori yang masih dipakai
// project melempar P2003. Tanpa intervensi, `handleApiError` sudah memetakan
// P2003 ke 409 — tapi pesannya generik ("Record is referenced by other
// records") dan tidak memberi tahu admin apa yang harus dilakukan. Soft delete
// aman: itu UPDATE, jadi tidak pernah menyentuh FK, dan selalu bisa di-restore.
function isRestrictViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "P2003"
  );
}

const CATEGORY_IN_USE =
  "This category is still used by one or more projects. Reassign those projects to another category, or remove the projects, then purge it.";

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
    const session = await requireAdminSession({ ip, action: "purge:category", entityId: id });
    actorId = session.user.id;
    const rate = await applyRateLimit("userAction", session.user.id, "purge:category");
    if (!rate.allowed) {
      logSecurityEvent({ action: "purge:category", actorId, entityId: id, ip, ok: false });
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      logSecurityEvent({ action: "purge:category", actorId, entityId: id, ip, ok: false });
      return errorResponse("confirm=true is required to permanently delete", 400);
    }

    const existing = await prisma.category.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      logSecurityEvent({ action: "purge:category", actorId, entityId: id, ip, ok: false });
      return errorResponse("Category not found in trash", 404);
    }

    await prisma.category.delete({ where: { id } });

    revalidateTag("categories", { expire: 0 });

    logSecurityEvent({ action: "purge:category", actorId, entityId: id, ip, ok: true });
    return successResponse({ message: "Category permanently deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponseFrom(error, "Category operation failed");
    }
    logSecurityEvent({ action: "purge:category", actorId, entityId, ip, ok: false });
    if (isRestrictViolation(error)) {
      return errorResponse(CATEGORY_IN_USE, 409);
    }
    return errorResponseFrom(error, "Category operation failed");
  }
}
