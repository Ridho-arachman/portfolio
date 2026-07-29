"use client";

import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // FIX: Tunda pembaruan state ke animation frame berikutnya
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Spring physics for smooth movement
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };

  // Different layers move at different speeds (parallax depth)
  const layer1X = useSpring(
    useTransform(mouseX, [-1, 1], [-20, 20]),
    springConfig,
  );
  const layer1Y = useSpring(
    useTransform(mouseY, [-1, 1], [-20, 20]),
    springConfig,
  );

  const layer2X = useSpring(
    useTransform(mouseX, [-1, 1], [-40, 40]),
    springConfig,
  );
  const layer2Y = useSpring(
    useTransform(mouseY, [-1, 1], [-40, 40]),
    springConfig,
  );

  const layer3X = useSpring(
    useTransform(mouseX, [-1, 1], [-60, 60]),
    springConfig,
  );
  const layer3Y = useSpring(
    useTransform(mouseY, [-1, 1], [-60, 60]),
    springConfig,
  );

  // 3D tilt for main content
  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], [5, -5]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], [-5, 5]),
    springConfig,
  );

  // ==========================================
  // SKELETON LOADING STATE
  // ==========================================
  if (!mounted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
        {/* Background tetap ada agar tidak terlihat kosong total */}
        <div className="absolute top-1/4 left-1/4 w-100 h-100 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Skeleton Content yang meniru layout asli */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto w-full space-y-8">
          {/* Skeleton 404 Text */}
          <div className="h-32 md:h-48 w-3/4 mx-auto bg-text-muted/10 rounded-3xl animate-pulse" />

          {/* Skeleton Heading */}
          <div className="h-8 w-1/2 mx-auto bg-text-muted/10 rounded-xl animate-pulse" />

          {/* Skeleton Paragraph */}
          <div className="space-y-3 max-w-md mx-auto">
            <div className="h-4 w-full bg-text-muted/10 rounded-lg animate-pulse" />
            <div className="h-4 w-5/6 mx-auto bg-text-muted/10 rounded-lg animate-pulse" />
          </div>

          {/* Skeleton Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="h-14 w-40 bg-text-muted/10 rounded-full animate-pulse" />
            <div className="h-14 w-32 bg-text-muted/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CONTENT (Setelah Mounted)
  // ==========================================
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* LAYER 1: Deep Background (Slowest) */}
      <m.div
        style={{ x: layer1X, y: layer1Y }}
        className="absolute top-1/4 left-1/4 w-100 h-100 bg-accent/10 rounded-full blur-[120px] pointer-events-none"
      />
      <m.div
        style={{ x: layer1X, y: layer1Y }}
        className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-white/5 rounded-full blur-[120px] pointer-events-none"
      />

      {/* LAYER 2: Floating Geometric Shapes (Medium) */}
      <m.div
        style={{ x: layer2X, y: layer2Y }}
        className="absolute top-20 left-20 w-20 h-20 border-2 border-accent/20 rounded-lg rotate-45 pointer-events-none"
      />
      <m.div
        style={{ x: layer2X, y: layer2Y }}
        className="absolute bottom-32 right-32 w-16 h-16 border-2 border-accent/30 rounded-full pointer-events-none"
      />
      <m.div
        style={{ x: layer2X, y: layer2Y }}
        className="absolute top-1/3 right-1/4 w-12 h-12 bg-accent/10 rounded-lg rotate-12 pointer-events-none"
      />

      {/* LAYER 3: Small Particles (Fastest) */}
      <m.div
        style={{ x: layer3X, y: layer3Y }}
        className="absolute top-1/4 right-1/3 w-2 h-2 bg-accent rounded-full pointer-events-none shadow-[0_0_10px_rgba(167,139,250,0.8)]"
      />
      <m.div
        style={{ x: layer3X, y: layer3Y }}
        className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-accent/60 rounded-full pointer-events-none shadow-[0_0_15px_rgba(167,139,250,0.6)]"
      />
      <m.div
        style={{ x: layer3X, y: layer3Y }}
        className="absolute top-2/3 left-1/3 w-2 h-2 bg-accent/40 rounded-full pointer-events-none shadow-[0_0_10px_rgba(167,139,250,0.4)]"
      />

      {/* NOISE TEXTURE */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* MAIN CONTENT (3D Tilt) */}
      <m.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 text-center px-4 max-w-2xl mx-auto"
      >
        {/* 404 Text */}
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
          style={{ transform: "translateZ(80px)" }}
        >
          <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none text-gradient-elegant select-none">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-accent/20 -z-10 scale-110" />
        </m.div>

        {/* Error Message */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ transform: "translateZ(40px)" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
            <br />
            Let&apos;s get you back on track.
          </p>
        </m.div>

        {/* CTA Buttons */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ transform: "translateZ(60px)" }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.5)] transition-all duration-300"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border border-glass-border bg-glass-bg backdrop-blur-xl text-text-primary font-semibold hover:border-accent/50 hover:bg-accent-muted transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </m.div>

        {/* Decorative Sparkle */}
        <m.div
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 text-accent/30 pointer-events-none"
          style={{ transform: "translateZ(100px)" }}
        >
          <Sparkles size={40} />
        </m.div>
      </m.div>

      {/* FLOATING GRID (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-grid-elegant opacity-20 pointer-events-none" />
    </div>
  );
}
