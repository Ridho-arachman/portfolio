import { CertificatesBackgroundProps } from "./constants";

export function CertificatesBackground({}: CertificatesBackgroundProps) {
  return (
    <>
      <div className="glow-blob-accent pointer-events-none absolute top-0 right-0 w-125 h-125 rounded-full" />
      <div className="glow-blob-white pointer-events-none absolute bottom-0 left-0 w-150 h-150 rounded-full" />
    </>
  );
}