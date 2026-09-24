import { HeroBackground } from "./hero-background";
import { HeroContent } from "./hero-content";
import { Locale } from "@/lib/i18n";

interface HeroSectionProps {
  locale: Locale;
}

export function HeroSection({ locale }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground />
      <HeroContent key={locale} locale={locale} />
    </section>
  );
}
