import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slug";
import { requireAdminSession } from "@/lib/session";
import {successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination, errorResponseFrom } from "@/lib/api-helpers";
import { categoryCreateSchema } from "@/schema/category";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return paginatedResponse(data, { page, pageSize, total, totalPages });
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const parsed = categoryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.name);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        order: data.order,
      },
    });

    return successResponse(category, 201);
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}
