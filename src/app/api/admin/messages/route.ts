import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import {
  errorResponse,
  paginatedResponse,
  parsePagination,
} from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);
    const status = searchParams.get("status") as
      | "NEW"
      | "READ"
      | "REPLIED"
      | "ARCHIVED"
      | null;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return paginatedResponse(data, { page, pageSize, total, totalPages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
