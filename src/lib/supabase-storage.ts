import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials for storage");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const BUCKET_NAME = "portfolio-images";

export async function uploadImage(
  file: File,
  path: string,
): Promise<{ url: string; path: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

export function generateImagePath(
  entityType: "projects" | "experience" | "certificates",
  entityId: string,
  fileName: string,
): string {
  const sanitizedName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  const timestamp = Date.now();
  return `${entityType}/${entityId}/${timestamp}-${sanitizedName}`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size: 5MB",
    };
  }

  return { valid: true };
}