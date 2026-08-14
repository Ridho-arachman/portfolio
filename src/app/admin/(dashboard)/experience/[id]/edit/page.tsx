import type { Metadata } from "next";
import { ExperienceFormPage } from "@/components/sections/admin-experience";

export const metadata: Metadata = {
  title: "Edit Experience",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExperienceFormPage mode="edit" experienceId={id} />;
}
