import type { Metadata } from "next";
import { CertificateFormPage } from "@/components/sections/admin-certificates";

export const metadata: Metadata = {
  title: "Edit Certificate",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CertificateFormPage mode="edit" certificateId={id} />;
}
