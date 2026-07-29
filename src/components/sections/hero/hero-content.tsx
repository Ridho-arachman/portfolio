"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight, Globe } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { HeroContentProps } from "./constants";

export function HeroContent({
  textY,
  textOpacity,
  textBlur,
  rotateX,
  rotateY,
  isMobile,
  containerVariants,
  itemVariants,
}: HeroContentProps) {
  return (
    <m.div
      style={
        isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }
      }
      className="relative z-10 w-full max-w-5xl mx-auto px-4"
    >
      <m.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: textY, opacity: textOpacity, filter: textBlur }}
        className="text-center"
      >
        {/* Badge */}
        <m.div variants={itemVariants} className="mb-8">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 backdrop-blur-md shadow-[0_0_20px_rgba(167,139,250,0.05)] text-accent font-semibold tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Available for hire
          </Badge>
        </m.div>

        {/* Main Heading */}
        <m.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.9]"
          style={isMobile ? {} : { transform: "translateZ(50px)" }}
        >
          Building the
          <br />
          <span className="text-gradient-elegant inline-block relative">
            Future
            <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 rounded-full scale-150" />
          </span>
        </m.h1>

        {/* Subheading */}
        <m.p
          variants={itemVariants}
          className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          style={isMobile ? {} : { transform: "translateZ(30px)" }}
        >
          Information Systems student crafting immersive, high-performance web
          experiences with modern tech stacks.
        </m.p>

        {/* CTA Buttons */}
        {/* CTA Buttons */}
        <m.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          style={isMobile ? {} : { transform: "translateZ(40px)" }}
        >
          <MagneticButton className="text-lg px-10 py-5 h-auto rounded-full">
            View Projects{" "}
            <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>

          <Button
            variant="outline"
            className="group px-10 py-5 h-auto rounded-full border border-white/8 text-text-primary hover:bg-white/5 hover:border-accent/50 hover:text-accent transition-all font-medium text-lg"
          >
            <Link
              href="/contact"
              className="flex items-center justify-center gap-3 w-full h-full"
            >
              <Globe className="w-5 h-5 shrink-0 group-hover:rotate-180 transition-transform duration-700" />
              <span>Contact Me</span>
            </Link>
          </Button>
        </m.div>
      </m.div>
    </m.div>
  );
}
