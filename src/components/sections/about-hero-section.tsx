"use client";

import {
  MotionValue,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { Code2, Database, Globe, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

// ==========================================
// SUB-COMPONENT: Floating Tech Icon
// ==========================================
interface FloatingTechIconProps {
  icon: React.ComponentType<{ className?: string }>;
  mouseX: MotionValue<number>; // FIX: Tipe data spesifik
  mouseY: MotionValue<number>; // FIX: Tipe data spesifik
  intensity?: number;
  floatDuration?: number;
  scrollY: MotionValue<number>; // FIX: Dibuat wajib (required) agar hook selalu jalan
  scrollIntensity?: number;
  className?: string;
}

function FloatingTechIcon({
  icon: Icon,
  mouseX,
  mouseY,
  intensity = 20,
  floatDuration = 4,
  scrollY,
  scrollIntensity = 0,
  className,
}: FloatingTechIconProps) {
  const springConfig = { damping: 20, stiffness: 100 };

  // FIX: Semua hook dipanggil di level teratas (TIDAK ADA KONDISIONAL)
  const mouseParallaxX = useSpring(
    useTransform(mouseX, [-1, 1], [-intensity, intensity]),
    springConfig,
  );

  const mouseParallaxY = useSpring(
    useTransform(mouseY, [-1, 1], [-intensity, intensity]),
    springConfig,
  );

  // FIX: Hook ini SELALU dipanggil, tidak pakai ternary operator
  const scrollParallaxY = useTransform(scrollY, [0, 1], [0, -scrollIntensity]);

  return (
    // Layer 1: Menangani pergerakan Scroll (Sumbu Y) dan Mouse (Sumbu X)
    <m.div
      style={{
        x: mouseParallaxX,
        y: scrollParallaxY,
      }}
      className={className}
    >
      {/* Layer 2: Menangani animasi Floating (naik-turun) + Mouse (Sumbu Y) */}
      <m.div
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ y: mouseParallaxY }}
        className="p-4 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl pointer-events-none"
      >
        <Icon className="w-8 h-8 text-accent/60" />
      </m.div>
    </m.div>
  );
}

// ==========================================
// MAIN COMPONENT: About Hero Section
// ==========================================
export function AboutHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Mouse tracking untuk parallax icons
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax Transforms - Background layers
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const bgY3 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // Variants untuk staggered text reveal
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 80, filter: "blur(20px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: "circOut",
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* ==========================================
          LAYER 1: Deep Background Blobs (Paling Lambat)
      ========================================== */}
      <m.div
        style={{ y: bgY1 }}
        className="absolute top-0 left-1/4 w-150 h-150 bg-accent/10 rounded-full blur-[150px] pointer-events-none"
      />
      <m.div
        style={{ y: bgY2 }}
        className="absolute bottom-0 right-1/4 w-125 h-125 bg-white/5 rounded-full blur-[150px] pointer-events-none"
      />

      {/* ==========================================
          LAYER 2: Perspective Grid (Bergerak Cepat)
      ========================================== */}
      <m.div
        style={{ y: bgY3 }}
        className="absolute inset-0 bg-grid-elegant opacity-20 pointer-events-none"
      />

      {/* ==========================================
          LAYER 3: Floating Tech Icons (Mouse + Scroll Parallax)
      ========================================== */}
      <FloatingTechIcon
        icon={Code2}
        mouseX={mouseX}
        mouseY={mouseY}
        intensity={40}
        floatDuration={5}
        scrollY={scrollYProgress}
        scrollIntensity={250}
        className="absolute top-1/4 left-[15%] hidden md:block"
      />

      <FloatingTechIcon
        icon={Database}
        mouseX={mouseX}
        mouseY={mouseY}
        intensity={25}
        floatDuration={4}
        scrollY={scrollYProgress}
        scrollIntensity={180}
        className="absolute top-1/3 right-[20%] hidden md:block"
      />

      <FloatingTechIcon
        icon={Globe}
        mouseX={mouseX}
        mouseY={mouseY}
        intensity={60}
        floatDuration={6}
        scrollY={scrollYProgress}
        scrollIntensity={220}
        className="absolute bottom-1/3 left-[25%] hidden md:block"
      />

      {/* ==========================================
          LAYER 4: Small Particles (Paling Cepat - Mouse Parallax Only)
      ========================================== */}
      <m.div
        style={{
          x: useSpring(useTransform(mouseX, [-1, 1], [-80, 80]), {
            damping: 30,
            stiffness: 80,
          }),
          y: useSpring(useTransform(mouseY, [-1, 1], [-80, 80]), {
            damping: 30,
            stiffness: 80,
          }),
        }}
        className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent rounded-full pointer-events-none shadow-[0_0_10px_rgba(167,139,250,0.8)]"
      />
      <m.div
        style={{
          x: useSpring(useTransform(mouseX, [-1, 1], [-100, 100]), {
            damping: 30,
            stiffness: 80,
          }),
          y: useSpring(useTransform(mouseY, [-1, 1], [-100, 100]), {
            damping: 30,
            stiffness: 80,
          }),
        }}
        className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-accent/60 rounded-full pointer-events-none shadow-[0_0_15px_rgba(167,139,250,0.6)]"
      />

      {/* ==========================================
          NOISE TEXTURE
      ========================================== */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ==========================================
          MAIN CONTENT (Text dengan Parallax & Stagger Reveal)
      ========================================== */}
      <m.div
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
        className="relative z-10 container mx-auto px-4 text-center max-w-4xl"
      >
        <m.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Breadcrumb Badge */}
          <m.div variants={itemVariants} className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-accent-muted border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase">
              Get to know me
            </span>
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
    </section>
  );
}
