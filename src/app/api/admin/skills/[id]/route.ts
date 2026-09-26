import prisma from "@/lib/prisma";
import { notDeleted, slugReserved } from "@/lib/soft-delete";
import { skillUpdateSchema } from "@/schema/skill";
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

    const skill = await prisma.skill.findUnique({ where: { id, ...notDeleted } });

    if (!skill) {
      return errorResponse("Skill not found", 404);
    }

    return successResponse(skill);
  } catch (error) {
    return errorResponseFrom(error, "Skill operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:skill");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = skillUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.skill.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Skill not found", 404);
    }

    const data = parsed.data;

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.iconName !== undefined && { iconName: data.iconName || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.proficiency !== undefined && {
          proficiency: data.proficiency,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(skill);
  } catch (error) {
    return errorResponseFrom(
      error,
      "Skill operation failed",
      slugReserved("Skill"),
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:skill");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.skill.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Skill not found", 404);
    }

    await prisma.skill.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return successResponse({ message: "Skill moved to trash" });
  } catch (error) {
    return errorResponseFrom(error, "Skill operation failed");
  }
}
