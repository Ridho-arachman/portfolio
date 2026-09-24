"use client";

import { AnimatePresence, useReducedMotion, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggleFloating() {
  const { toggleTheme, resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return <div className="fixed right-6 bottom-6 z-50 w-14 h-20" />;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (toggling) return;
    setToggling(true);
    toggleTheme();
    setTimeout(() => setToggling(false), 200);
  };

  return (
    <motion.div className="fixed right-6 bottom-6 z-50">
      <motion.button
        onClick={handleToggle}
        disabled={toggling}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        className="relative group"
        aria-label="Toggle theme"
        aria-busy={toggling}
      >
        {/* 1. Outer Glow Ring (Electric Violet) */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { rotate: isDark ? 360 : 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-accent/20 blur-md group-hover:bg-accent/30 group-hover:blur-lg transition-all duration-500"
        />

        {/* 2. Main Button Container (Glassmorphism Pill) */}
        <motion.div
          layout
          className="relative flex flex-col items-center justify-center w-14 h-20 rounded-full bg-bg-secondary/80 backdrop-blur-md border border-white/10 group-hover:border-accent/50 transition-all duration-300 overflow-hidden shadow-2xl"
        >
          {/* 3. Sliding Background Indicator */}
          <motion.div
            layoutId="theme-indicator"
            className="absolute w-10 h-10 rounded-full bg-accent/10"
            animate={prefersReducedMotion ? undefined : { y: isDark ? -12 : 12 }}
            transition={prefersReducedMotion ? undefined : { type: "spring", stiffness: 300, damping: 25 }}
          />

          {/* 4. Sun Icon (Top) */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { opacity: isDark ? 0.4 : 1, scale: isDark ? 0.8 : 1 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
            className="relative z-10 mb-1"
          >
            <Sun className="w-5 h-5 text-accent" />
          </motion.div>

          {/* 5. Divider Line */}
          <div className="w-6 h-px bg-white/10 my-1" />

          {/* 6. Moon Icon (Bottom) */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { opacity: isDark ? 1 : 0.4, scale: isDark ? 1 : 0.8 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
            className="relative z-10"
          >
            <Moon className="w-5 h-5 text-accent" />
          </motion.div>
        </motion.div>

        {/* 7. Tooltip on Hover */}
        <AnimatePresence>
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: -10, scale: 0.95 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -10, scale: 0.95 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.2 }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-white/10 text-xs text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl"
          >
            {isDark ? "Switch to Light" : "Switch to Dark"}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}