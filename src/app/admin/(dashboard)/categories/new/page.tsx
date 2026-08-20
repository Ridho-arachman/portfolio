import type { Metadata } from "next";
import { CategoryFormPage } from "@/components/sections/admin-categories";

export const metadata: Metadata = {
  title: "New Category",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewCategoryPage() {
  return <CategoryFormPage mode="create" />;
}
