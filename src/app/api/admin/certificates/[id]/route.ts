import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const updateCertificateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3).optional(),
  issuer: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  skills: z.array(z.string()).optional(),
  summary: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({ where: { id } });

    if (!certificate) {
      return errorResponse("Certificate not found", 404);
    }

    return successResponse(certificate);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateCertificateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Certificate not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.title ? generateSlug(data.title) : undefined);

    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.issuer !== undefined && { issuer: data.issuer }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
        ...(data.thumbnail !== undefined && {
          thumbnail: data.thumbnail || null,
        }),
        ...(data.gallery !== undefined && { gallery: data.gallery }),
        ...(data.credentialId !== undefined && {
          credentialId: data.credentialId || null,
        }),
        ...(data.credentialUrl !== undefined && {
          credentialUrl: data.credentialUrl || null,
        }),
        ...(data.issueDate !== undefined && {
          issueDate: new Date(data.issueDate),
        }),
        ...(data.expiryDate !== undefined && {
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        }),
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(certificate);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Certificate not found", 404);
    }

    await prisma.certificate.delete({ where: { id } });

    return successResponse({ message: "Certificate deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
