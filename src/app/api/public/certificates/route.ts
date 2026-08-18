import prisma from "@/lib/prisma";
import { paginatedResponse, parsePagination } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { skip, pageSize, page } = parsePagination(searchParams);

    const where = { isPublished: true };

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.certificate.count({ where }),
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
