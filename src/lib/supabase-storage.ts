import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "portfolio-images";

let cachedClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase credentials for storage");
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function detectImageMime(buffer: Buffer): string | null {
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function resolveContentType(path: string, buffer: Buffer): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const expected = EXTENSION_CONTENT_TYPE[ext];
  if (!expected) throw new Error("Unsupported file extension");
  const detected = detectImageMime(buffer);
  if (!detected || detected !== expected) {
    throw new Error("File content does not match its extension");
  }
  return expected;
}

export async function uploadImage(
  file: File,
  path: string,
): Promise<{ url: string; path: string }> {
  const supabaseAdmin = getSupabaseClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const contentType = resolveContentType(path, buffer);

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function deleteImage(path: string): Promise<void> {
  const supabaseAdmin = getSupabaseClient();
  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export function getPublicUrl(path: string): string {
  const supabaseAdmin = getSupabaseClient();
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

export function validateImageFile(file: File): { valid: boolean; error?: string } {  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024;

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
