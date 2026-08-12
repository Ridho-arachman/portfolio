"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import type { Project } from "./constants";
import { PROJECT_DETAIL } from "./constants";

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

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
        <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {PROJECT_DETAIL.galleryTitle}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {project.gallery.map((img, idx) => (
          <m.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(img)}
            className="cursor-pointer"
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