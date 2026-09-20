"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminLogin } from "@/components/sections/admin-login";

export const dynamic = "force-dynamic";

function AdminLoginPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return <AdminLogin error={error || undefined} />;
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AdminLoginPageContent />
    </Suspense>
  );
}
