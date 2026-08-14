import * as m from "motion/react-m";
import { CertificatesBackgroundProps } from "./constants";

export function CertificatesBackground({
  bgY1,
  bgY2,
}: CertificatesBackgroundProps) {
  return (
    <>
      <m.div
        style={{ y: bgY1 }}
        className="absolute top-0 right-0 w-125 h-125 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
      />
      <m.div
        style={{ y: bgY2 }}
        className="absolute bottom-0 left-0 w-150 h-150 bg-white/5 rounded-full blur-[120px] pointer-events-none"
      />
    </>
  );
}
