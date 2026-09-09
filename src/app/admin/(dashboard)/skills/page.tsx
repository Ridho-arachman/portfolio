import { Suspense } from "react";
import type { Metadata } from "next";
import { SkillsList } from "@/components/sections/admin-skills";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skills",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSkillsPage() {
  return (
    <Suspense fallback={null}>
      <SkillsList />
    </Suspense>
  );
}
