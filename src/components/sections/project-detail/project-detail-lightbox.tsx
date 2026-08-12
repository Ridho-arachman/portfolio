"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as m from "motion/react-m";
import { AnimatePresence } from "framer-motion";
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
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl p-4"
        onClick={onClose}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-6 right-6 rounded-full bg-glass-bg border border-glass-border hover:bg-accent-muted transition-colors z-10"
        >
          <X className="w-6 h-6 text-text-primary" />
        </Button>
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative max-w-5xl w-full aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          <Image src={image} alt="Full view" fill className="object-contain" />
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}