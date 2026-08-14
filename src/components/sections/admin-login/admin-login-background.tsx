"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import * as m from "motion/react-m";

function MagneticParticle({
  strength,
  className,
  children,
}: {
  strength: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
      y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [strength, x, y]);

  return (
    <m.div
      ref={ref}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function AdminLoginBackground() {
  return (
    <>
      {/* Aurora Orbs - magnetic follow + gentle float */}
      <MagneticParticle
        strength={0.12}
        className="absolute top-[-10%] left-[-10%] w-100 h-100 md:w-150 md:h-150 pointer-events-none"
      >
        <m.div
          animate={{ y: [0, -24, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-accent/10 rounded-full blur-[130px]"
        />
      </MagneticParticle>
      <MagneticParticle
        strength={0.12}
        className="absolute bottom-[-12%] right-[-8%] w-125 h-125 md:w-175 md:h-175 pointer-events-none"
      >
        <m.div
          animate={{ y: [0, 20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="w-full h-full bg-white/5 rounded-full blur-[130px]"
        />
      </MagneticParticle>

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Perspective Grid */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[50vh] bg-grid-elegant opacity-20 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />

      {/* Floating Particles */}
      <m.div
        animate={{ y: [0, -16, 0], rotate: [45, 60, 45], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[18%] left-[12%] w-6 h-6 border-2 border-accent/25 rounded-md pointer-events-none"
      />
      <MagneticParticle
        strength={0.3}
        className="absolute top-[28%] right-[14%] w-4 h-4 pointer-events-none"
      >
        <m.div
          animate={{ y: [0, 12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-full h-full border-2 border-accent/30 rounded-full"
        />
      </MagneticParticle>
      <MagneticParticle
        strength={0.3}
        className="absolute bottom-[24%] left-[18%] w-2 h-2 pointer-events-none"
      >
        <m.div
          animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="w-full h-full bg-accent/50 rounded-full shadow-[0_0_12px_rgba(167,139,250,0.6)]"
        />
      </MagneticParticle>
      <m.div
        animate={{ y: [0, 14, 0], rotate: [-12, 0, -12], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-[30%] right-[10%] w-3 h-3 bg-accent/40 rounded-lg rotate-12 shadow-[0_0_14px_rgba(167,139,250,0.5)] pointer-events-none"
      />
      <MagneticParticle
        strength={0.3}
        className="absolute top-[12%] left-[45%] w-1.5 h-1.5 pointer-events-none"
      >
        <m.div
          animate={{ y: [0, -12, 0], x: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.7 }}
          className="w-full h-full bg-accent/60 rounded-full"
        />
      </MagneticParticle>
    </>
  );
}
