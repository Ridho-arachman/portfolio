import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { slugify } from "@/utils/slug";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination, errorResponseFrom } from "@/lib/api-helpers";
import { experienceCreateSchema } from "@/schema/experience";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { company: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...notDeleted,
    };

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
    return errorResponseFrom(error, "Experience operation failed");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "create:experience");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const json = await req.json();
    const parsed = experienceCreateSchema.safeParse(json);

    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400);
    }

    const data = parsed.data;
    const slug = data.slug ?? slugify(data.title);

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

    revalidatePath("/experience");
    revalidatePath(`/experience/${experience.slug}`);
    revalidateTag("experiences", { expire: 0 });

    return successResponse(experience, 201);
  } catch (error) {
    return errorResponseFrom(error, "Experience operation failed");
  }
}