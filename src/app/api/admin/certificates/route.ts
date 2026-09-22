import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slug";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination, errorResponseFrom } from "@/lib/api-helpers";
import { certificateCreateSchema } from "@/schema/certificate";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const { page, pageSize, search, skip } = parsePagination(searchParams);

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { issuer: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.certificate.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return paginatedResponse(data, { page, pageSize, total, totalPages });
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "create:certificate");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const body = await req.json();
    const parsed = certificateCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.title);

    const certificate = await prisma.certificate.create({
      data: {
        slug,
        title: data.title,
        issuer: data.issuer,
        logoUrl: data.logoUrl || null,
        thumbnail: data.thumbnail || null,
        gallery: data.gallery ?? [],
        credentialId: data.credentialId || null,
        credentialUrl: data.credentialUrl || null,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        skills: data.skills,
        summary: data.summary,
        isPublished: data.isPublished,
        order: data.order,
      },
    });

    revalidatePath("/certificates");
    revalidatePath(`/certificates/${certificate.slug}`);
    revalidateTag("certificates", { expire: 0 });

    return successResponse(certificate, 201);
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}
