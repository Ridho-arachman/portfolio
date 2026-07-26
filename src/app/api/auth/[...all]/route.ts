// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

// Better Auth menangani semua method (GET, POST, dll) melalui handler ini
export const GET = (request: NextRequest) => auth.handler(request);
export const POST = (request: NextRequest) => auth.handler(request);
