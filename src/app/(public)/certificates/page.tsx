import { CERTIFICATES_LIST } from "@/components/sections/certificates/constants";
import { CertificateCard } from "@/components/sections/certificates/certificate-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Certificates | Ridho.dev",
  description:
    "Daftar lengkap sertifikasi profesional dan kredensial yang saya miliki.",
};

export default function CertificatesListPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-bg-primary">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="text-gradient-elegant">Certificates</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Professional certifications and credentials validating my expertise
            in cloud, front-end, data, and UX design.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CERTIFICATES_LIST.map((cert, index) => (
            <CertificateCard key={cert.id} cert={cert} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
