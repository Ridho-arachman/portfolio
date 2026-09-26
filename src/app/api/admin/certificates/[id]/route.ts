import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { slugify } from "@/utils/slug";
import { certificateUpdateSchema } from "@/schema/certificate";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import {successResponse, errorResponse, errorResponseFrom } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({ where: { id, ...notDeleted } });

    if (!certificate) {
      return errorResponse("Certificate not found", 404);
    }

    return successResponse(certificate);
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:certificate");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = certificateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.certificate.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Certificate not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.title ? slugify(data.title) : undefined);

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

    revalidatePath("/certificates");
    revalidatePath(`/certificates/${certificate.slug}`);
    revalidateTag("certificates", { expire: 0 });

    return successResponse(certificate);
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:certificate");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.certificate.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Certificate not found", 404);
    }

    await prisma.certificate.delete({ where: { id } });

    revalidatePath("/certificates");
    revalidatePath(`/certificates/${existing.slug}`);
    revalidateTag("certificates", { expire: 0 });

    return successResponse({ message: "Certificate deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Certificate operation failed");
  }
}
