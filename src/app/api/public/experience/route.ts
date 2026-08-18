import prisma from "@/lib/prisma";
import { paginatedResponse, parsePagination } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { skip, pageSize, page } = parsePagination(searchParams);

    const [data, total] = await Promise.all([
      prisma.experience.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.experience.count({ where: { isPublished: true } }),
    ]);

    return paginatedResponse(data, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return paginatedResponse([], {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });
  }
}