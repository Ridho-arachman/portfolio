"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useRef } from "react";
import { REPLAY_VIEWPORT } from "./experience/constants";
import { ExperienceTimeline } from "./experience/experience-timeline";

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background Blob Parallax */}
      <m.div
        style={{ y: bgY }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-125 h-125 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REPLAY_VIEWPORT}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"
          >
            My Journey
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Work <span className="text-gradient-elegant">Experience</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A timeline of my professional growth, leadership roles, and
            real-world impact.
          </p>
        </m.div>

        {/* Timeline & Cards */}
        <ExperienceTimeline />

        {/* Bottom CTA (Shadcn UI Button) */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 md:mt-24"
        >
          <Button
            size="lg"
            className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 group"
          >
            <Link href="/experience" className="inline-flex items-center gap-2">
              Lihat Semua Pengalaman
              <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}
