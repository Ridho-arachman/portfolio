"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ExperienceListData } from "./constants";
import { EXPERIENCE_DETAIL } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

interface ExperienceDetailGalleryProps {
  exp: ExperienceListData;
  onSelect: (image: string) => void;
}

export function ExperienceDetailGallery({
  exp,
  onSelect,
}: ExperienceDetailGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();

  if (!exp.gallery || exp.gallery.length === 0) {
    return null;
  }

  return (
    <m.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.2 }}
      className="md:col-span-1"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
        <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.experienceDetail[EXPERIENCE_DETAIL.galleryKey]}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {exp.gallery.map((img, idx) => (
          <m.div
            key={idx}
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? undefined : { duration: 0.4, delay: idx * 0.1 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            onClick={() => onSelect(img)}
            tabIndex={0}
            role="button"
            className="cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Card className="relative aspect-square overflow-hidden border border-glass-border bg-transparent shadow-none group">
              <CardContent className="p-0 h-full w-full">
                <Image
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300" />
              </CardContent>
            </Card>
          </m.div>
        ))}
      </div>
    </m.div>
  );
}