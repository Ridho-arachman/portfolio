"use client";

import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { HeroContentProps } from "./constants";

export function HeroContent({ isMobile }: HeroContentProps) {
  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
      <div className="text-center animate-fade-in-up">
        {/* Badge */}
        <div className="mb-8 animate-fade-in-up delay-100">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 backdrop-blur-md shadow-[0_0_20px_rgba(167,139,250,0.05)] text-accent font-semibold tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Available for hire
          </Badge>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.9] animate-fade-in-up delay-200">
          Building the
          <br />
          <span className="text-gradient-elegant inline-block relative">
            Future
            <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 rounded-full scale-150" />
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-300">
          Information Systems student crafting immersive, high-performance web
          experiences with modern tech stacks.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-400">
          <MagneticButton className="px-8 py-4 text-base sm:px-10 sm:py-5 sm:text-lg h-auto rounded-full">
            View Projects{" "}
            <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>

          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/8 px-10 py-5 text-lg font-medium text-text-primary transition-all hover:bg-white/5 hover:border-accent/50 hover:text-accent"
          >
            <Globe className="h-5 w-5 shrink-0 group-hover:rotate-180 transition-transform duration-700" />
            <span>Contact Me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}