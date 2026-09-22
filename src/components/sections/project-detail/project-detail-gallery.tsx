"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "./constants";
import { PROJECT_DETAIL } from "./constants";

gsap.registerPlugin(ScrollTrigger);

interface ProjectDetailGalleryProps {
  project: Project;
  onSelect: (image: string) => void;
}

export function ProjectDetailGallery({
  project,
  onSelect,
}: ProjectDetailGalleryProps) {
  if (!project.gallery || project.gallery.length === 0) {
    return null;
  }

  const prefersReducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !wrapRef.current || !trackRef.current) return;
    const ctx = gsap.context(() => {
      const distance = trackRef.current!.scrollWidth - window.innerWidth;
      gsap.to(trackRef.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={wrapRef} className="relative overflow-hidden">
      <m.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
          <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          {PROJECT_DETAIL.galleryTitle}
        </h2>
        <div ref={trackRef} className="flex h-[100dvh] items-center gap-4">
          {project.gallery.map((img, idx) => (
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
              className="cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 shrink-0 flex-shrink-0"
            >
              <Card className="relative aspect-square w-[400px] md:w-[500px] overflow-hidden border border-glass-border bg-transparent shadow-none group">
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
    </section>
  );
}