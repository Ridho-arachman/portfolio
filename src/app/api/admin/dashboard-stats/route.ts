import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();

    const [projects, experiences, certificates, messages, unreadMessages] =
      await Promise.all([
        prisma.project.count(),
        prisma.experience.count(),
        prisma.certificate.count(),
        prisma.message.count(),
        prisma.message.count({ where: { status: "NEW" } }),
      ]);

    return successResponse({
      projects,
      experiences,
      certificates,
      messages,
      unreadMessages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
