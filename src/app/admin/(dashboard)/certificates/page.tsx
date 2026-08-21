import { Suspense } from "react";
import type { Metadata } from "next";
import { CertificatesList } from "@/components/sections/admin-certificates";

export const metadata: Metadata = {
  title: "Certificates",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCertificatesPage() {
  return (
    <Suspense fallback={null}>
      <CertificatesList />
    </Suspense>
  );
}
