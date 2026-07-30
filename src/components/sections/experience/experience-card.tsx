"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // <-- IMPORT SHADCN CARD
import { ArrowRight, Award, Briefcase, Calendar, MapPin } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import {
  cardVariants,
  type ExperienceCardProps,
  REPLAY_VIEWPORT,
} from "./constants";

export function ExperienceCard({ exp, index, isLeft }: ExperienceCardProps) {
  const teaserDescription = exp.description.slice(0, 2);

  return (
    <m.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      transition={{ delay: index * 0.1 }}
      className={`relative flex flex-col md:flex-row gap-8 ${isLeft ? "md:flex-row-reverse" : ""}`}
    >
      {/* Dot di tengah garis timeline */}
      <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-bg-primary border-2 border-accent -translate-x-1/2 mt-8 z-10 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />

      {/* Konten Kartu */}
      <div
        className={`flex-1 ${isLeft ? "md:text-right md:pr-12" : "md:pl-12"} pl-12 md:pl-0`}
      >
        {/* Wrapper Motion untuk animasi hover, Card di dalamnya */}
        <m.div whileHover={{ y: -4 }} className="group h-full">
          <Card
            className="h-full relative rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_rgba(167,139,250,0.1)] transition-all duration-300"
            style={{ borderWidth: 0, boxShadow: "none" }}
          >
            {/* 1. Thumbnail Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
              <Image
                src={exp.thumbnail}
                alt={exp.role}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              />

              {/* Type Badge (Shadcn UI) - Inline rendering untuk hindari error React */}
              <Badge
                variant="outline"
                className={`absolute top-4 z-20 gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary/80 backdrop-blur-md border-glass-border text-xs font-semibold text-accent ${isLeft ? "right-4" : "left-4"}`}
              >
                {exp.type === "Organization" ? (
                  <Award className="w-3.5 h-3.5" />
                ) : (
                  <Briefcase className="w-3.5 h-3.5" />
                )}
                {exp.type}
              </Badge>
            </div>

            {/* 2. Card Content (Shadcn UI CardContent) */}
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors mb-1">
                  {exp.role}
                </h3>
                <p
                  className={`text-sm font-medium text-text-secondary flex items-center gap-1.5 ${isLeft ? "md:justify-end" : "justify-start"}`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {exp.company} • {exp.location}
                </p>
                <p
                  className={`text-xs font-medium text-text-muted mt-1 flex items-center gap-1.5 ${isLeft ? "md:justify-end" : "justify-start"}`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {exp.period}
                </p>
              </div>

              {/* Teaser Description */}
              <div
                className={`space-y-2 text-sm text-text-secondary leading-relaxed flex flex-col ${isLeft ? "md:items-end" : ""}`}
              >
                {teaserDescription.map((point, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${isLeft ? "md:flex-row-reverse" : ""}`}
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 ${isLeft ? "order-first" : ""}`}
                    />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* 3. Gallery Teaser & See More Button */}
              <div className="pt-4 border-t border-glass-border space-y-4">
                {/* Gallery Preview */}
                {exp.gallery.length > 0 && (
                  <div
                    className={`flex gap-2 ${isLeft ? "md:justify-end" : ""}`}
                  >
                    {exp.gallery.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden border border-glass-border"
                      >
                        <Image
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                    ))}
                    {exp.gallery.length > 3 && (
                      <div className="shrink-0 w-16 h-16 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                        +{exp.gallery.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button (Shadcn UI) - PERBAIKAN: KEMBALIKAN asChild */}
                <Button
                  variant="ghost"
                  className={`h-auto p-0 text-accent hover:text-accent-hover hover:bg-transparent justify-start md:justify-end group/btn ${isLeft ? "md:flex-row-reverse" : ""}`}
                >
                  <Link
                    href={`/experience/${exp.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    Lihat Detail Lengkap
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </m.div>
      </div>

      {/* Spacer untuk sisi yang kosong di desktop */}
      <div className="hidden md:block flex-1" />
    </m.div>
  );
}
