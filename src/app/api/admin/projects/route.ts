import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createProjectSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().min(10),
  thumbnail: z.string().url(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  technologies: z.array(z.string()),
  gallery: z.array(z.string()),
  role: z.string().optional(),
  year: z.string().optional(),
  highlights: z.array(z.string()),
  isPublished: z.boolean(),
  order: z.number(),
  categoryId: z.string().optional(),
});

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
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.title);

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

    return successResponse(project, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
