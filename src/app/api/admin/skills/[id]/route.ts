import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const updateSkillSchema = z.object({
  name: z.string().min(1).optional(),
  iconUrl: z.string().optional(),
  category: z
    .enum(["FRONTEND", "BACKEND", "DATABASE", "DEVOPS_TOOLS", "SOFT_SKILL"])
    .optional(),
  proficiency: z.number().min(1).max(100).optional(),
  order: z.number().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return errorResponse("Skill not found", 404);
    }

    return successResponse(skill);
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
    const parsed = updateSkillSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Skill not found", 404);
    }

    const data = parsed.data;

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.iconUrl !== undefined && { iconUrl: data.iconUrl || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.proficiency !== undefined && {
          proficiency: data.proficiency,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(skill);
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

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Skill not found", 404);
    }

    await prisma.skill.delete({ where: { id } });

    return successResponse({ message: "Skill deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}
