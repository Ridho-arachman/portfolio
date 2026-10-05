"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import type { Project } from "./constants";
import { PROJECT_DETAIL } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

interface ProjectDetailGalleryProps {
  project: Project;
  onSelect: (image: string) => void;
}

export function ProjectDetailGallery({
  project,
  onSelect,
}: ProjectDetailGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const gallery = project.gallery ?? [];

  if (gallery.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <m.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
          <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          {t.projectDetail[PROJECT_DETAIL.galleryTitleKey]}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {gallery.map((img, idx) => (
            <m.div
              key={img}
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? undefined : { duration: 0.4, delay: idx * 0.1 }}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            >
              <button
                type="button"
                onClick={() => onSelect(img)}
                className="block w-full cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Card className="relative aspect-square overflow-hidden border border-glass-border bg-transparent shadow-none group">
                  <CardContent className="p-0 h-full w-full">
                    <Image
                      src={img}
                      alt={t.projectDetail.galleryImage.replaceAll(
                        "{index}",
                        String(idx + 1),
                      )}
                      fill
                      sizes="(max-width: 768px) 50vw, 400px"
                      className="object-cover transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300" />
                  </CardContent>
                </Card>
              </button>
            </m.div>
          ))}
        </div>
      </m.div>
    </section>
  );
}
