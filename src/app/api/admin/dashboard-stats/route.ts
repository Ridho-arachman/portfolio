import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import { successResponse, errorResponseFrom } from "@/lib/api-helpers";
import { parseDateRange } from "@/lib/date-range";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(req.url);
    // Tanpa param = all-time (backward-compat): whereCreatedAt undefined.
    const { from, to, whereCreatedAt } = parseDateRange(searchParams);

    const baseWhere = whereCreatedAt
      ? { ...notDeleted, createdAt: whereCreatedAt }
      : { ...notDeleted };

    const [projects, experiences, certificates, messages, unreadMessages] =
      await Promise.all([
        prisma.project.count({ where: baseWhere }),
        prisma.experience.count({ where: baseWhere }),
        prisma.certificate.count({ where: baseWhere }),
        prisma.message.count({ where: baseWhere }),
        prisma.message.count({ where: { ...baseWhere, status: "NEW" } }),
      ]);

    return successResponse({
      projects,
      experiences,
      certificates,
      messages,
      unreadMessages,
      from: from?.toISOString() ?? null,
      to: to?.toISOString() ?? null,
    });
  } catch (error) {
    return errorResponseFrom(error, "Failed to load dashboard stats");
  }
}
