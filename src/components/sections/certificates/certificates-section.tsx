"use client";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpRight, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRef } from "react";
import { CERTIFICATES_VIEWPORT, type CertificateListData } from "./constants";
import { CertificateCard } from "./certificate-card";
import { CertificatesBackground } from "./certificates-background";

interface CertificatesSectionProps {
  certificates: CertificateListData[];
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pb-14">
      <CertificatesBackground />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            My <span className="text-gradient-elegant">Certificates</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Professional certifications and credentials that validate my skills
            and continuous learning journey.
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Certificates will appear here once published."
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
            href="/certificates"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "group rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300",
            )}
          >
            View Certificates
            <ArrowUpRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}