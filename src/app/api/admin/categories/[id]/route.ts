import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slug";
import { categoryUpdateSchema } from "@/schema/category";
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

    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    return successResponse(category);
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:category");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = categoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    const data = parsed.data;
    const slug =
      data.slug || (data.name ? slugify(data.name) : undefined);

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(slug !== undefined && { slug }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(category);
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:category");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    await prisma.category.delete({ where: { id } });

    return successResponse({ message: "Category deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Category operation failed");
  }
}
