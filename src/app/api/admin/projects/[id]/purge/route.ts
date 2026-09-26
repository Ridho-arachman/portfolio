import { revalidatePath, revalidateTag } from "next/cache";
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
    const rate = await applyRateLimit("userAction", session.user.id, "purge:project");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    // `?confirm=true` wajib: purge adalah satu-satunya operasi yang menghapus
    // baris beserta seluruh isinya, jadi klik tanpa sengaja tidak boleh
    // sampai ke database.
    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      return errorResponse("confirm=true is required to permanently delete", 400);
    }

    const existing = await prisma.project.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      return errorResponse("Project not found in trash", 404);
    }

    await prisma.project.delete({ where: { id } });

    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidateTag("projects", { expire: 0 });

    return successResponse({ message: "Project permanently deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}
