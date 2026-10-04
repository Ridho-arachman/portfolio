"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import type { CertificateListData } from "./constants";

interface CertificateDetailGalleryProps {
  cert: CertificateListData;
}

export function CertificateDetailGallery({ cert }: CertificateDetailGalleryProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  if (cert.gallery.length === 0) return null;

  return (
    <section
      aria-labelledby="certificate-gallery-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="certificate-gallery-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.certificateDetail.gallery}
      </h2>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {cert.gallery.map((img, idx) => (
          <Card
            key={img}
            className="relative aspect-square overflow-hidden border border-glass-border bg-transparent shadow-none group"
          >
            <CardContent className="p-0 h-full w-full">
              <Image
                src={img}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 490px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300" />
              {/* Overlay button rather than a `role="button"` div: reachable and
                  Enter/Space-activatable for free, and it carries the name so the
                  image itself can stay decorative instead of announcing twice. */}
              <button
                type="button"
                aria-label={`${t.common.preview} ${idx + 1}`}
                onClick={() => setSelected(img)}
                className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={cert.title}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl p-4 animate-fade-in-up"
        >
          <Button
            variant="ghost"
            size="icon"
            autoFocus
            aria-label={t.common.close}
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 rounded-full bg-glass-bg border border-glass-border hover:bg-accent-muted transition-colors z-10"
          >
            <X className="w-6 h-6 text-text-primary" />
          </Button>
          <div
            className="relative max-w-5xl w-full aspect-video"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selected}
              alt={cert.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}