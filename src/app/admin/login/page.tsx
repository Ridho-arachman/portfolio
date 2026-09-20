"use client";

import { useSearchParams } from "next/navigation";
import { AdminLogin } from "@/components/sections/admin-login";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return <AdminLogin error={error || undefined} />;
}
