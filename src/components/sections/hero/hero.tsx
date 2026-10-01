import { HeroContent, type HeroSkill } from "./hero-content";
import { Locale } from "@/lib/i18n";

interface HeroSectionProps {
  locale: Locale;
  skills: HeroSkill[];
}

export function HeroSection({ locale, skills }: HeroSectionProps) {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: [
          "radial-gradient(125% 62% at 50% -10%, rgba(4,6,15,.86) 0%, rgba(4,6,15,.34) 44%, transparent 68%)",
          "linear-gradient(180deg, transparent 16%, rgba(4,6,15,.72) 40%, rgba(4,6,15,.64) 52%, rgba(4,6,15,.18) 68%, transparent 82%)",
        ].join(", "),
      }}
    >
      <HeroContent key={locale} locale={locale} skills={skills} />
    </section>
  );
}
