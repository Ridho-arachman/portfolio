import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { messageStatusUpdateSchema } from "@/schema/message";
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

    const message = await prisma.message.findUnique({ where: { id, ...notDeleted } });

    if (!message) {
      return errorResponse("Message not found", 404);
    }

    return successResponse(message);
  } catch (error) {
    return errorResponseFrom(error, "Message operation failed");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "update:message");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = messageStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.message.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Message not found", 404);
    }

    const message = await prisma.message.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return successResponse(message);
  } catch (error) {
    return errorResponseFrom(error, "Message operation failed");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const rate = await applyRateLimit("userAction", session.user.id, "delete:message");
    if (!rate.allowed) {
      return errorResponse("RATE_LIMITED", 429, rate.headers);
    }

    const { id } = await params;

    const existing = await prisma.message.findUnique({ where: { id, ...notDeleted } });
    if (!existing) {
      return errorResponse("Message not found", 404);
    }

    await prisma.message.delete({ where: { id } });

    return successResponse({ message: "Message deleted" });
  } catch (error) {
    return errorResponseFrom(error, "Message operation failed");
  }
}
