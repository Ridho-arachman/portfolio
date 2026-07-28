"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggleFloating() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Gunakan requestAnimationFrame untuk menunda update state
    // ke cycle render berikutnya. Ini menghindari warning "cascading renders"
    // dari React, tetapi tetap memastikan komponen hanya dirender di client.
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    // Cleanup function untuk mencegah memory leak jika komponen unmount cepat
    return () => cancelAnimationFrame(frame);
  }, []);

  // Opsional: Saat belum mounted, kembalikan div kosong dengan ukuran yang sama
  // untuk mencegah "layout shift" (lompatan tampilan) saat tombol tiba-tiba muncul.
  // Karena posisi Anda 'fixed', return null juga tidak masalah.
  if (!mounted) {
    return <div className="fixed right-6 bottom-6 z-50 w-14 h-20" />;
  }

  const isDark = theme === "dark";

  return (
    <m.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed right-6 bottom-6 z-50"
    >
      <m.button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative group"
        aria-label="Toggle theme"
      >
        {/* Outer Glow Ring */}
        <m.div
          animate={{
            rotate: isDark ? 360 : 0,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full bg-linear-to-br from-accent-primary/20 to-accent-secondary/20 blur-md group-hover:blur-lg transition-all"
        />

        {/* Main Button Container - Vertical Pill Shape */}
        <m.div
          layout
          className="relative flex flex-col items-center justify-center w-14 h-20 rounded-full bg-background/80 backdrop-blur-md border-2 border-border group-hover:border-accent-primary/50 transition-all duration-300 overflow-hidden"
        >
          {/* Sliding Background Indicator */}
          <m.div
            layoutId="theme-indicator"
            className="absolute w-10 h-10 rounded-full bg-accent-primary/10"
            animate={{
              y: isDark ? -10 : 10,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />

          {/* Sun Icon (Top) */}
          <m.div
            animate={{
              opacity: isDark ? 0.3 : 1,
              scale: isDark ? 0.8 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="relative z-10 mb-1"
          >
            <Sun className="w-5 h-5 text-accent-primary" />
          </m.div>

          {/* Divider Line */}
          <div className="w-6 h-px bg-border/50 my-1" />

          {/* Moon Icon (Bottom) */}
          <m.div
            animate={{
              opacity: isDark ? 1 : 0.3,
              scale: isDark ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Moon className="w-5 h-5 text-accent-primary" />
          </m.div>
        </m.div>

        {/* Tooltip on Hover */}
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </m.div>
        </AnimatePresence>
      </m.button>
    </m.div>
  );
}
