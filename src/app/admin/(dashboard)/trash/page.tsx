import type { Metadata } from "next";
import { TrashList } from "@/components/sections/admin-trash";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trash",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminTrashPage() {
  return <TrashList />;
}
