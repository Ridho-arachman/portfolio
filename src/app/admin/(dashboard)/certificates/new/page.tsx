import type { Metadata } from "next";
import { CertificateFormPage } from "@/components/sections/admin-certificates";

export const metadata: Metadata = {
  title: "New Certificate",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewCertificatePage() {
  return <CertificateFormPage mode="create" />;
}
