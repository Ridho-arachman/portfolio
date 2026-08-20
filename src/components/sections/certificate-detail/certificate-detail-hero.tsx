"use client";

import { Badge } from "@/components/ui/badge";
import { CERTIFICATE_DETAIL } from "./constants";
import type { CertificateListData } from "./constants";
import { ArrowLeft, Award, Calendar, ShieldCheck } from "lucide-react";
import type { MotionValue } from "framer-motion";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";

interface CertificateDetailHeroProps {
  cert: CertificateListData;
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
}

export function CertificateDetailHero({
  cert,
  headerY,
  headerScale,
  headerOpacity,
}: CertificateDetailHeroProps) {
  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <m.div
        style={{ y: headerY, scale: headerScale }}
        className="absolute inset-0"
      >
        {cert.thumbnail ? (
          <Image
            src={cert.thumbnail}
            alt={cert.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/5">
            <Award className="h-24 w-24 opacity-20 text-accent" />
          </div>
        )}
      </m.div>

      <div className="absolute inset-0 bg-linear-to-t from-bg-primary via-bg-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-bg-primary/40 to-transparent" />

      <div className="absolute top-24 left-0 right-0 z-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href={CERTIFICATE_DETAIL.backHref}
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {CERTIFICATE_DETAIL.backLabel}
          </Link>
        </div>
      </div>

      <m.div
        style={{ opacity: headerOpacity }}
        className="absolute bottom-0 left-0 right-0 z-10 pb-12"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 backdrop-blur-md border-accent/30 text-xs font-semibold text-accent"
              >
                <Award className="w-3.5 h-3.5" />
                Certificate
              </Badge>
              {cert.credentialId && (
                <Badge
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md border-emerald-500/30 text-xs font-semibold text-emerald-400"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-4 leading-tight">
              {cert.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-text-secondary">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" /> {cert.issuer}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> {cert.period}
              </span>
            </div>
          </m.div>
        </div>
      </m.div>
    </div>
  );
}
