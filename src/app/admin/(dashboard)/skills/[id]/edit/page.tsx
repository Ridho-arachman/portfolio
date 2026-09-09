import type { Metadata } from "next";
import { SkillFormPage } from "@/components/sections/admin-skills";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Skill",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SkillFormPage mode="edit" skillId={id} />;
}
