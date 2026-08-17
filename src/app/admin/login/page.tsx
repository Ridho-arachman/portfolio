import type { Metadata } from "next";
import { AdminLogin } from "@/components/sections/admin-login";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AdminLogin error={error} />;
}
