import type { Metadata } from "next";
import { ProjectFormPage } from "@/components/sections/admin-projects";

export const metadata: Metadata = {
  title: "Edit Project",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectFormPage mode="edit" projectId={id} />;
}
