import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import {successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination, errorResponseFrom } from "@/lib/api-helpers";
import { skillCreateSchema } from "@/schema/skill";

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
      prisma.skill.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.skill.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return paginatedResponse(data, { page, pageSize, total, totalPages });
  } catch (error) {
    return errorResponseFrom(error, "Skill operation failed");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const parsed = skillCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        iconName: data.iconName || null,
        category: data.category,
        proficiency: data.proficiency,
        order: data.order,
      },
    });

    return successResponse(skill, 201);
  } catch (error) {
    return errorResponseFrom(error, "Skill operation failed");
  }
}
