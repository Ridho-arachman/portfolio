"use client";

import { Badge } from "@/components/ui/badge";
import { EXPERIENCE_DETAIL } from "./constants";
import type { ExperienceListData } from "./constants";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { MotionValue } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

interface ExperienceDetailHeroProps {
  exp: ExperienceListData;
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
}

export function ExperienceDetailHero({
  exp,
  headerY,
  headerScale,
  headerOpacity,
}: ExperienceDetailHeroProps) {
  const { t, locale } = useTranslation();
  const isOrg = exp.type === "ORGANIZATION";
  const TypeIcon: LucideIcon = isOrg ? Award : Briefcase;

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <m.div
        style={{ y: headerY, scale: headerScale }}
        className="absolute inset-0"
      >
        <Image
          src={exp.thumbnail ?? ""}
          alt={exp.role}
          fill
          className="object-cover"
          priority
        />
      </m.div>

      <div className="absolute inset-0 bg-linear-to-t from-bg-primary via-bg-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-bg-primary/40 to-transparent" />

      <div className="absolute top-24 left-0 right-0 z-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href={`/${locale}${EXPERIENCE_DETAIL.backHref}`}
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t.experienceDetail[EXPERIENCE_DETAIL.backKey]}
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
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 backdrop-blur-md border-accent/30 text-xs font-semibold text-accent mb-4"
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {exp.type}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-4 leading-tight">
              {exp.role}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-text-secondary">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> {exp.company} •{" "}
                {exp.location}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> {exp.period}
              </span>
            </div>
          </m.div>
        </div>
      </m.div>
    </div>
  );
}