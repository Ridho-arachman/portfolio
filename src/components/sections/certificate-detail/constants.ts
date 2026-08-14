import type { CertificateListData } from "@/components/sections/certificates/constants";

export type { CertificateListData };

export const CERTIFICATE_DETAIL = {
  backLabel: "Kembali ke Sertifikat",
  backHref: "/certificates",
  summaryTitle: "Apa yang Saya Pelajari",
  skillsTitle: "Keterampilan Terverifikasi",
  verificationTitle: "Verify Credential",
  verificationDescription:
    "Pastikan keaslian sertifikat ini melalui halaman verifikasi resmi dari penyedia kredensial.",
  verifyLabel: "Verify Certificate",
  prevLabel: "Sertifikat Sebelumnya",
  nextLabel: "Sertifikat Selanjutnya",
} as const;

export type { CertificateListData as CertificateDetailData };
