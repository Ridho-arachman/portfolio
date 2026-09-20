import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slug";
import { projectCreateSchema } from "@/schema/project";
import { requireAdminSession } from "@/lib/session";
import {successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);

    const where = search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {};

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return paginatedResponse(data, { page, pageSize, total, totalPages });
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const parsed = projectCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.title);

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        thumbnail: data.thumbnail,
        liveUrl: data.liveUrl || null,
        repoUrl: data.repoUrl || null,
        technologies: data.technologies,
        gallery: data.gallery,
        role: data.role || null,
        year: data.year || null,
        highlights: data.highlights,
        isPublished: data.isPublished,
        order: data.order,
        categoryId: data.categoryId || null,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    revalidateTag("projects", { expire: 0 });

    return successResponse(project, 201);
  } catch (error) {
    return errorResponseFrom(error, "Project operation failed");
  }
}
