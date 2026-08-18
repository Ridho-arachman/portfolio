import prisma from "@/lib/prisma";
import {
  successResponse,
  paginatedResponse,
  parsePagination,
} from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { skip, pageSize, page } = parsePagination(searchParams);
    const categorySlug = searchParams.get("category");

    let categoryId: string | undefined;
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (!category) {
        return paginatedResponse([], {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        });
      }
      categoryId = category.id;
    }

    const where = {
      isPublished: true,
      ...(categoryId ? { categoryId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return paginatedResponse(data, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return successResponse(null, 500);
  }
}
