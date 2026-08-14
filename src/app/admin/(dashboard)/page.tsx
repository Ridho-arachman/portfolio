import type { Metadata } from "next";
import { AdminDashboard } from "@/components/sections/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
