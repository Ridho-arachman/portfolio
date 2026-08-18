import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/session";
import {
  uploadImage,
  deleteImage,
  generateImagePath,
  validateImageFile,
} from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

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

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const path = generateImagePath(entityType, entityId, file.name);
    const { url } = await uploadImage(file, path);

    return NextResponse.json({ url, path }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    await deleteImage(path);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}