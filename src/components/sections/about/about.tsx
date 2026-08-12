"use client";

import { Badge } from "@/components/ui/badge";
import * as m from "motion/react-m";
import { AboutAvatar } from "./about-avatar";
import { AboutBackground } from "./about-background";
import { AboutContent } from "./about-content";
import { AboutMarquee } from "./about-marquee";
import { REPLAY_VIEWPORT } from "./constants";
import { useAboutAnimations } from "./use-about-animations";

export function AboutSection() {
  const { blobY, avatarY, textY } = useAboutAnimations();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <AboutBackground blobY={blobY} />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REPLAY_VIEWPORT}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"
          >
            About Me
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Bridging <span className="text-linear-elegant">Business</span> &{" "}
            <span className="text-linear-elegant">Technology</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            As an Information Systems graduate specializing in E-Business from
            Universitas Bina Bangsa, I don&apos;t just write code, I design
            solutions that deliver real impact.
          </p>
        </m.div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-20">
          <AboutAvatar avatarY={avatarY} />
          <AboutContent textY={textY} />
        </div>

        {/* Tech Stack Marquee */}
        <AboutMarquee />
      </div>
    </section>
  );
}
