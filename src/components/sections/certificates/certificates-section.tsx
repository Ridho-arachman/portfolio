"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpRight, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRef } from "react";
import { type CertificateListData } from "./constants";
import { CertificateCard } from "./certificate-card";
import { CertificatesBackground } from "./certificates-background";
import { useTranslation } from "@/hooks/use-translation";

interface CertificatesSectionProps {
  certificates: CertificateListData[];
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const { t, locale } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const titleWords = t.certificates.title.split(" ");
  const titleAccent = titleWords.pop() ?? t.certificates.title;
  const titleMain = titleWords.join(" ");

  return (
    <section ref={sectionRef} className="relative overflow-hidden pb-14">
      <CertificatesBackground />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"
          >
            {t.certificates.subtitle}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {titleMain ? <>{titleMain} </> : null}<span className="text-gradient-elegant">{titleAccent}</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            {t.certificates.headerDesc}
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title={t.certificates.noCertificates}
            description={t.certificates.noCertificatesDesc}
            className="mb-16 animate-fade-in-up delay-200"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {certificates.slice(0, 3).map((cert, index) => (
              <CertificateCard key={cert.slug} cert={cert} index={index} />
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center animate-fade-in-up delay-400">
          {/* Link styled as button (no Button wrapping Link -> valid HTML, full-size tap target) */}
          <Link
            href={`/${locale}/certificates`}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "group rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 min-h-[48px] min-w-[48px] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            )}
          >
            {t.certificates.viewAll}
            <ArrowUpRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}