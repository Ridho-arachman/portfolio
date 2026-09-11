import { CertificatesBackgroundProps } from "./constants";

export function CertificatesBackground({}: CertificatesBackgroundProps) {
  return (
    <>
      <div className="absolute top-0 right-0 w-125 h-125 bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-0 left-0 w-150 h-150 bg-white/5 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />
    </>
  );
}