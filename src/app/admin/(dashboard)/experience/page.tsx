import { Suspense } from "react";
import type { Metadata } from "next";
import { ExperiencesList } from "@/components/sections/admin-experience";

export const metadata: Metadata = {
  title: "Experience",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminExperiencePage() {
  return (
    <Suspense fallback={null}>
      <ExperiencesList />
    </Suspense>
  );
}
