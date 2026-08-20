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

const createCertificateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3),
  issuer: z.string().min(2),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  skills: z.array(z.string()),
  summary: z.array(z.string()),
  isPublished: z.boolean(),
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
    const parsed = createCertificateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const slug = data.slug || generateSlug(data.title);

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

    return successResponse(certificate, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
