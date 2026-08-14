import { useScroll, useTransform, type MotionValue } from "framer-motion";
import type { CertificateListData } from "@/components/sections/certificates/constants";

export interface UseCertificateDetailReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
}

export function getAdjacentCertificates(
  list: CertificateListData[],
  slug: string,
): { prev: CertificateListData | null; next: CertificateListData | null } {
  const index = list.findIndex((c) => c.slug === slug);
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export function useCertificateDetail(
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseCertificateDetailReturn {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  return {
    containerRef,
    headerY: useTransform(scrollYProgress, [0, 1], [0, 200]),
    headerScale: useTransform(scrollYProgress, [0, 1], [1, 1.1]),
    headerOpacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]),
  };
}
