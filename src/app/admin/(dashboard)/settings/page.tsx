import type { Metadata } from "next";
import { SettingsPage } from "@/components/sections/admin-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSettingsPage() {
  return <SettingsPage />;
}
