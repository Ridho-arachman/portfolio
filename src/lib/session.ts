// lib/session.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { UserRole } from "@/types/domain";
import { logSecurityEvent } from "@/lib/security-log";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

// Helper opsional: Untuk memaksa user harus login di Server Action/Route
export async function requireServerSession() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

// Khusus route /admin: user harus login DAN berperan ADMIN.
// `opts` opsional agar 30 pemanggil lama tak berubah; route teruskan ip/action/entity
// agar penolakan 401 meninggalkan jejak actor/ip/waktu di stdout.
export async function requireAdminSession(opts?: {
  ip?: string;
  action?: string;
  entityId?: string;
}) {
  const action = opts?.action ?? "admin.auth";
  let session;
  try {
    session = await requireServerSession();
  } catch {
    logSecurityEvent({
      action,
      entityId: opts?.entityId,
      ip: opts?.ip,
      ok: false,
    });
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "ADMIN") {
    logSecurityEvent({
      action,
      actorId: session.user.id,
      entityId: opts?.entityId,
      ip: opts?.ip,
      ok: false,
    });
    throw new Error("Unauthorized");
  }
  return session;
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}
