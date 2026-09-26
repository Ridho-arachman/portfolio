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
    const rate = await applyRateLimit("userAction", session.user.id, "purge:certificate");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    if (new URL(req.url).searchParams.get("confirm") !== "true") {
      return errorResponse("confirm=true is required to permanently delete", 400);
    }

    const existing = await prisma.certificate.findUnique({
      where: { id, ...trashedOnly },
    });
    if (!existing) {
      return errorResponse("Certificate not found in trash", 404);
    }

    await prisma.certificate.delete({ where: { id } });

    revalidatePath("/certificates");
    revalidatePath(`/certificates/${existing.slug}`);
    revalidateTag("certificates", { expire: 0 });

    return successResponse({ message: "Certificate permanently deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}
