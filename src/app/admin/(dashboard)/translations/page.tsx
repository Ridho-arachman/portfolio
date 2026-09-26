import type { Metadata } from "next";
import { TranslationsEditor } from "@/components/sections/admin-translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Translations",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminTranslationsPage() {
  return <TranslationsEditor />;
}
