import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { errorResponseFrom } from "@/lib/api-helpers";
import { getClientIp } from "@/utils/client-ip";
import {
  uploadImage,
  deleteImage,
  generateImagePath,
  validateImageFile,
} from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";

const ENTITY_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ENTITY_TYPES = ["projects", "experience", "certificates"] as const;
const DELETE_PREFIXES = ["projects/", "experience/", "certificates/"];

function isAllowedDeletePath(path: string): boolean {
  if (path.includes("..") || path.includes("\\")) return false;
  const normalized = path.replace(/^\/+/, "");
  return DELETE_PREFIXES.some((p) => normalized.startsWith(p));
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const ip = getClientIp(new Headers(request.headers));
    const rate = await applyRateLimit("upload", ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429, headers: rate.headers },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entityType = formData.get("entityType") as
      | "projects"
      | "experience"
      | "certificates";
    const entityId = formData.get("entityId") as string;

    if (!file || !entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields: file, entityType, entityId" },
        { status: 400 },
      );
    }

    if (
      !ENTITY_TYPES.includes(entityType as (typeof ENTITY_TYPES)[number]) ||
      typeof entityId !== "string" ||
      !ENTITY_ID_RE.test(entityId)
    ) {
      return NextResponse.json({ error: "Invalid entityType or entityId" }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const path = generateImagePath(entityType, entityId, file.name);
    const { url } = await uploadImage(file, path);

    return NextResponse.json({ url, path }, { status: 201 });
  } catch (error) {
    return errorResponseFrom(error, "Upload failed");
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();

    const ip = getClientIp(new Headers(request.headers));
    const rate = await applyRateLimit("upload", ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429, headers: rate.headers },
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    if (!isAllowedDeletePath(path)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    await deleteImage(path.replace(/^\/+/, ""));

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponseFrom(error, "Delete failed");
  }
}