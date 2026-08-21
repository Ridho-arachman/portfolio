import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoriesList } from "@/components/sections/admin-categories";

export const metadata: Metadata = {
  title: "Categories",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesList />
    </Suspense>
  );
}
