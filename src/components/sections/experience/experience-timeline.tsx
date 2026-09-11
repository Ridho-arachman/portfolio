"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { useRef, useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import { ExperienceCard } from "./experience-card";
import type { Experience } from "./constants";

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollYProgress, setScrollYProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = 1 - Math.max(0, Math.min(1, (rect.bottom - viewportHeight) / (rect.height + viewportHeight)));
      setScrollYProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (experiences.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No experiences yet"
        description="Work experiences will appear here once added."
      />
    );
  }

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto">
      {/* Static Background Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-glass-border -translate-x-1/2" />
      
      {/* Animated Progress Line */}
      <div
        className="absolute left-4 md:left-1/2 top-0 w-px bg-accent -translate-x-1/2 shadow-[0_0_10px_rgba(167,139,250,0.5)] animate-timeline-progress"
        style={{ transformOrigin: "top", transform: `scaleY(${scrollYProgress})` } as React.CSSProperties}
      />

      {/* Cards List */}
      <div className="space-y-12 md:space-y-16">
        {experiences.map((exp, index) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  );
}