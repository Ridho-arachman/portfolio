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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createExperienceSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3),
  company: z.string().min(2),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  type: z.enum(["WORK", "ORGANIZATION", "FREELANCE", "EDUCATION", "CERTIFICATION"]),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.array(z.string()),
  gallery: z.array(z.string()),
  isPublished: z.boolean().default(true),
  order: z.number(),
});

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.experience.count({ where }),
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
    const json = await req.json();
    const parsed = createExperienceSchema.safeParse(json);

    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400);
    }

    const data = parsed.data;
    const slug = data.slug ?? generateSlug(data.title);

    const experience = await prisma.experience.create({
      data: {
        ...data,
        slug,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description ?? [],
        gallery: data.gallery ?? [],
      },
    });

    return successResponse(experience, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}