import { revalidatePath, revalidateTag } from "next/cache";
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
    const rate = await applyRateLimit("userAction", session.user.id, "restore:project");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    // Hanya baris yang benar-benar di-trash yang bisa di-restore, supaya
    // panggilan ganda tidak diam-diam resurrect baris yang masih live.
    const existing = await prisma.project.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      return errorResponse("Project not found in trash", 404);
    }

    const project = await prisma.project.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidateTag("projects", { expire: 0 });

    return successResponse(project);
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}
