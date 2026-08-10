"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, Briefcase, Calendar, MapPin } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { type ExperienceListItemProps } from "./constants";

export function ExperienceListItem({
  exp,
  index = 0,
}: ExperienceListItemProps) {
  return (
    // 1. Outer Wrapper: Animasi Scroll Reveal (Fade In + Slide Up)
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }} // Bisa di-replay saat scroll
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/experience/${exp.slug}`} className="group block h-full">
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
                src={exp.thumbnail}
                alt={exp.role}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              />

              {/* Type Badge (Shadcn UI) - Inline rendering untuk menghindari error React */}
              <Badge
                variant="outline"
                className="absolute top-4 left-4 z-20 gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary/80 backdrop-blur-md border-glass-border text-xs font-semibold text-accent"
              >
                {exp.type === "Organization" ? (
                  <Award className="w-3.5 h-3.5" />
                ) : (
                  <Briefcase className="w-3.5 h-3.5" />
                )}
                {exp.type}
              </Badge>
            </div>

            {/* 2. Card Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                  {exp.role}
                </h3>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-1" />
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {exp.company} • {exp.location}
                </p>
                <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {exp.period}
                </p>
              </div>

              {/* Deskripsi ringkas (digabung jadi string, dibatasi 3 baris) */}
              <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                {exp.description.join(" ")}
              </p>
            </div>
          </Card>
        </m.div>
      </Link>
    </m.div>
  );
}
