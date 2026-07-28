// _components/sections/hero-section.tsx
"use client";

import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function HeroSection() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Scroll Parallax
  const bgY = useTransform(scrollY, [0, 600], [0, 250]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.3]);
  const textY = useTransform(scrollY, [0, 600], [0, -150]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const textBlur = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(10px)"]);

  // Mouse 3D Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [8, -8]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
    springConfig,
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: "circOut" },
    },
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden perspective-1000"
    >
      {/* Background Orbs - Elegant Monochrome */}
      <m.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute top-[-10%] left-[-10%] w-150 h-150 md:w-225 md:h-225 bg-accent/10 rounded-full blur-[150px] pointer-events-none"
      />
      <m.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute bottom-[-10%] right-[-10%] w-125 h-125 md:w-200 md:h-200 bg-white/5 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          // Ini adalah SVG fractal noise asli. Sangat ringan dan tidak perlu load gambar eksternal.
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3D Tilt Content */}
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
          <m.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(167,139,250,0.05)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-semibold text-accent tracking-wider uppercase">
              Available for hire
            </span>
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
          <m.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            style={isMobile ? {} : { transform: "translateZ(40px)" }}
          >
            <MagneticButton className="text-lg px-10 py-5">
              View Projects{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>

            <Link
              href="/contact"
              className="group px-10 py-5 rounded-full border border-white/8 text-text-primary hover:bg-white/5 hover:border-accent/50 hover:text-accent transition-all font-medium flex items-center gap-3 text-lg"
            >
              <Globe className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              Contact Me
            </Link>
          </m.div>
        </m.div>
      </m.div>

      {/* Perspective Grid */}
      <m.div
        style={{
          y: useTransform(scrollY, [0, 600], [100, 400]),
          opacity: useTransform(scrollY, [0, 300], [0, 0.3]),
        }}
        className="absolute bottom-0 left-0 right-0 h-[60vh] bg-grid-elegant pointer-events-none"
      />
    </section>
  );
}
