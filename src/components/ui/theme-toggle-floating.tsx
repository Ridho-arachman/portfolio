"use client";

import { AnimatePresence } from "framer-motion"; // Standarisasi ke framer-motion
import { Moon, Sun } from "lucide-react";
import * as m from "motion/react-m";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggleFloating() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mencegah hydration mismatch dengan menunda render sampai client-side
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Placeholder untuk mencegah layout shift saat pertama kali load
  if (!mounted) {
    return <div className="fixed right-6 bottom-6 z-50 w-14 h-20" />;
  }

  const isDark = theme === "dark";

  return (
    <m.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
      className="fixed right-6 bottom-6 z-50"
    >
      <m.button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
        aria-label="Toggle theme"
      >
        {/* 1. Outer Glow Ring (Electric Violet) */}
        <m.div
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-accent/20 blur-md group-hover:bg-accent/30 group-hover:blur-lg transition-all duration-500"
        />

        {/* 2. Main Button Container (Glassmorphism Pill) */}
        <m.div
          layout
          className="relative flex flex-col items-center justify-center w-14 h-20 rounded-full bg-bg-secondary/80 backdrop-blur-md border border-white/10 group-hover:border-accent/50 transition-all duration-300 overflow-hidden shadow-2xl"
        >
          {/* 3. Sliding Background Indicator */}
          <m.div
            layoutId="theme-indicator"
            className="absolute w-10 h-10 rounded-full bg-accent/10"
            animate={{
              y: isDark ? -12 : 12, // Geser ke atas (Dark) atau bawah (Light)
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />

          {/* 4. Sun Icon (Top) */}
          <m.div
            animate={{
              opacity: isDark ? 0.4 : 1,
              scale: isDark ? 0.8 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="relative z-10 mb-1"
          >
            <Sun className="w-5 h-5 text-accent" />
          </m.div>

          {/* 5. Divider Line */}
          <div className="w-6 h-px bg-white/10 my-1" />

          {/* 6. Moon Icon (Bottom) */}
          <m.div
            animate={{
              opacity: isDark ? 1 : 0.4,
              scale: isDark ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Moon className="w-5 h-5 text-accent" />
          </m.div>
        </m.div>

        {/* 7. Tooltip on Hover */}
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            // Menggunakan group-hover dari parent button untuk trigger
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-white/10 text-xs text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl"
          >
            {isDark ? "Switch to Light" : "Switch to Dark"}
          </m.div>
        </AnimatePresence>
      </m.button>
    </m.div>
  );
}
