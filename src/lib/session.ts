// lib/session.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
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
