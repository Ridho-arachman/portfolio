"use client";

import { Badge } from "@/components/ui/badge";

import { Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import { AboutHeroContentProps } from "./constants";



export function AboutHeroContent({
  textY,
  textOpacity,
  textScale,
  containerVariants,
  itemVariants,
}: AboutHeroContentProps) {
  return (
    <m.div
      style={{ y: textY, opacity: textOpacity, scale: textScale }}
      className="relative z-10 container mx-auto px-4 text-center max-w-4xl"
    >
      <m.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Breadcrumb Badge - Menggunakan Shadcn UI Badge */}
        <m.div variants={itemVariants} className="mb-6">
          <Badge
            variant="outline"
            className="px-4 py-2 rounded-full border-accent/30 bg-accent-muted/50 text-accent text-xs font-semibold tracking-wider uppercase"
          >
            Get to know me
          </Badge>
        </m.div>

        {/* Main Heading */}
        <m.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.9]"
        >
          About{" "}
          <span className="text-linear-elegant inline-block relative">
            Me
            <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 rounded-full scale-150" />
          </span>
        </m.h1>

        {/* Subheading */}
        <m.p
          variants={itemVariants}
          className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          More than just code. Discover the person, the principles, and the
          journey behind the portfolio.
        </m.p>

        {/* Decorative Line */}
        <m.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <div className="h-px w-16 bg-linear-to-r from-transparent to-accent/50" />
          <Sparkles className="w-5 h-5 text-accent" />
          <div className="h-px w-16 bg-linear-to-l from-transparent to-accent/50" />
        </m.div>
      </m.div>
    </m.div>
  );
}
