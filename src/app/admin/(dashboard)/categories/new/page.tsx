import type { Metadata } from "next";
import { CategoryFormPageWrapper } from "@/components/sections/admin-categories/category-form-page-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Category",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewCategoryPage() {
  return <CategoryFormPageWrapper mode="create" />;
}
