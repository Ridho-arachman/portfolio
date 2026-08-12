"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";

interface ProjectDetailLightboxProps {
  image: string;
  onClose: () => void;
}

export function ProjectDetailLightbox({
  image,
  onClose,
}: ProjectDetailLightboxProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 rounded-full bg-glass-bg border border-glass-border hover:bg-accent-muted transition-colors"
      >
        <X className="w-6 h-6 text-text-primary" />
      </Button>
      <m.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative max-w-5xl w-full aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={image} alt="Full view" fill className="object-contain" />
      </m.div>
    </m.div>
  );
}