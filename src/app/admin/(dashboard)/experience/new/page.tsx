import type { Metadata } from "next";
import { ExperienceFormPage } from "@/components/sections/admin-experience";

export const metadata: Metadata = {
  title: "New Experience",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewExperiencePage() {
  return <ExperienceFormPage mode="create" />;
}
