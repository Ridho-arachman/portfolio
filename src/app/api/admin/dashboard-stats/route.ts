import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import {successResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();

    const [projects, experiences, certificates, messages, unreadMessages] =
      await Promise.all([
        prisma.project.count({ where: notDeleted }),
        prisma.experience.count({ where: notDeleted }),
        prisma.certificate.count({ where: notDeleted }),
        prisma.message.count({ where: notDeleted }),
        prisma.message.count({ where: { ...notDeleted, status: "NEW" } }),
      ]);

    return successResponse({
      projects,
      experiences,
      certificates,
      messages,
      unreadMessages,
    });
  } catch (error) {
    return errorResponseFrom(error, "Failed to load dashboard stats");
  }
}
