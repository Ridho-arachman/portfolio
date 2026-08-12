"use client";

import { useRef, useState } from "react";
import type { ExperienceListData } from "./constants";
import { useExperienceDetail } from "./use-experience-detail";
import { ExperienceDetailHero } from "./experience-detail-hero";
import { ExperienceDetailContent } from "./experience-detail-content";
import { ExperienceDetailGallery } from "./experience-detail-gallery";
import { ExperienceDetailNavigation } from "./experience-detail-navigation";
import { ExperienceDetailLightbox } from "./experience-detail-lightbox";

interface ExperienceDetailProps {
  exp: ExperienceListData;
  prev: ExperienceListData | null;
  next: ExperienceListData | null;
}

export function ExperienceDetail({ exp, prev, next }: ExperienceDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { headerY, headerScale, headerOpacity } = useExperienceDetail(containerRef);

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-bg-primary">
        <ExperienceDetailHero
          exp={exp}
          headerY={headerY}
          headerScale={headerScale}
          headerOpacity={headerOpacity}
        />

        <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-2 space-y-8">
              <ExperienceDetailContent exp={exp} />
            </div>
            <ExperienceDetailGallery
              exp={exp}
              onSelect={setSelectedImage}
            />
          </div>

          <ExperienceDetailNavigation prev={prev} next={next} />
        </div>
      </div>

      {selectedImage && (
        <ExperienceDetailLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}