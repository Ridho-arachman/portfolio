import type { Metadata } from "next";
import { SkillFormPage } from "@/components/sections/admin-skills";

export const metadata: Metadata = {
  title: "New Skill",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewSkillPage() {
  return <SkillFormPage mode="create" />;
}
