"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, Calendar, ShieldCheck } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { type CertificateCardProps } from "./constants";

export function CertificateCard({
  cert,
  index = 0,
}: CertificateCardProps) {
  return (
    // 1. Outer Wrapper: Animasi Scroll Reveal (Fade In + Slide Up)
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }} // Bisa di-replay saat scroll
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/certificates/${cert.slug}`} className="group block h-full">
        {/* 2. Inner Wrapper: Animasi Hover Lift (Naik sedikit saat di-hover) */}
        <m.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          {/* Shadcn UI Card */}
          <Card
            className="h-full rounded-2xl border border-glass-border bg-glass-bg overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_rgba(167,139,250,0.1)] transition-all duration-300"
            style={{ borderWidth: 0, boxShadow: "none" }}
          >
            {/* 1. Thumbnail Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
              <Image
                src={cert.thumbnail}
                alt={cert.title}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              />

              {/* Certificate Badge (Shadcn UI) */}
              <Badge
                variant="outline"
                className="absolute top-4 left-4 z-20 gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary/80 backdrop-blur-md border-glass-border text-xs font-semibold text-accent"
              >
                <Award className="w-3.5 h-3.5" />
                Certificate
              </Badge>

              {/* Verified Badge (jika ada kredensial) */}
              {cert.credentialId && (
                <Badge
                  variant="outline"
                  className="absolute top-4 right-4 z-20 gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md border-emerald-500/30 text-xs font-semibold text-emerald-400"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </Badge>
              )}
            </div>

            {/* 2. Card Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                  {cert.title}
                </h3>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-1" />
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  {cert.issuer}
                </p>
                <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {cert.period}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-accent-muted/50 text-accent border-accent/20 font-medium hover:bg-accent/10 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </m.div>
      </Link>
    </m.div>
  );
}
