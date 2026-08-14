import type { Metadata } from "next";
import { ProjectFormPage } from "@/components/sections/admin-projects";

export const metadata: Metadata = {
  title: "New Project",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewProjectPage() {
  return <ProjectFormPage mode="create" />;
}
