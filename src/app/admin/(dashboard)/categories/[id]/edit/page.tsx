import type { Metadata } from "next";
import { CategoryFormPage } from "@/components/sections/admin-categories";

export const metadata: Metadata = {
  title: "Edit Category",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryFormPage mode="edit" categoryId={id} />;
}
