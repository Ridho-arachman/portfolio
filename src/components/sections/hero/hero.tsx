"use client";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { HeroBackground } from "./hero-background";
import { HeroContent } from "./hero-content";

export function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements - CSS animations */}
      <HeroBackground />

      {/* Main Content - CSS animations */}
      <HeroContent isMobile={isMobile} />
    </section>
  );
}
