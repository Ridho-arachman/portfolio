"use client";

import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { CertificateListData } from "./constants";
import { CERTIFICATE_DETAIL } from "./constants";

interface CertificateDetailNavigationProps {
  prev: CertificateListData | null;
  next: CertificateListData | null;
}

interface NavCardProps {
  cert: CertificateListData;
  direction: "prev" | "next";
  label: string;
}

function NavCard({ cert, direction, label }: NavCardProps) {
  return (
    <Link
      href={`/certificates/${cert.slug}`}
      className={`group block h-full ${
        direction === "next" ? "text-right" : ""
      }`}
    >
      <Card className="h-full rounded-2xl border border-glass-border bg-glass-bg p-6 hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300">
        <CardContent className="p-0">
          <div
            className={`flex items-center gap-2 text-xs text-text-muted mb-2 ${
              direction === "next" ? "justify-end" : ""
            }`}
          >
            {direction === "prev" && (
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            )}
            {label}
            {direction === "next" && (
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
          <CardTitle className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
            {cert.title}
          </CardTitle>
          <CardDescription className="text-sm text-text-secondary mt-1">
            {cert.issuer}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CertificateDetailNavigation({
  prev,
  next,
}: CertificateDetailNavigationProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-24 pt-12 border-t border-glass-border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prev ? (
          <NavCard cert={prev} direction="prev" label={CERTIFICATE_DETAIL.prevLabel} />
        ) : (
          <div />
        )}
        {next ? (
          <NavCard cert={next} direction="next" label={CERTIFICATE_DETAIL.nextLabel} />
        ) : (
          <div />
        )}
      </div>
    </m.div>
  );
}
