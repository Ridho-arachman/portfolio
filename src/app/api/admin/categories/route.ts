import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
});

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
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.name);

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
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
