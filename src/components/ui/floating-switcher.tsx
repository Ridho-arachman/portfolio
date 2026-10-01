"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { MessageCircle, Moon, Sun } from "lucide-react";

import { PortoBot } from "@/components/faq/porto-bot";
import { useTheme } from "@/providers/theme-provider";

/** Lebar satu segmen (w-14) — dipakai sebagai ambang tengah saat drag. */
const SEGMENT_WIDTH = 56;
const SNAP = { type: "spring", stiffness: 400, damping: 32 } as const;

/**
 * Home bersifat fixed-dark: semua warnanya datang dari token `--color-ascend-*`
 * yang hardcoded dan tidak punya pasangan `.light`, plus `.ascend-chrome` yang
 * memaksa navbar/footer ikut gelap. Menampilkan tombol tema di sini hanya
 * memberi kontrol yang kelihatan hidup tanpa efek apa pun, jadi disembunyikan.
 */
const HOME_ROUTE = /^\/(en|id)\/?$/;

/**
 * Pengganti ThemeToggleFloating: satu pill dua segmen (Tema | PortoBot) yang
 * bisa diklik, dicoret keyboard, atau diseret mendatar. Memakai context tema
 * dan tidak menyentuh `useMessages()`/`useSiteSettings()` karena dirender dari
 * root layout, di luar PublicContentProvider.
 */
export function FloatingSwitcher() {
  const { toggleTheme, resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [focused, setFocused] = useState<0 | 1>(0);

  const dragX = useMotionValue(0);
  const themeRef = useRef<HTMLButtonElement>(null);
  const botRef = useRef<HTMLButtonElement>(null);
  const wasBotOpen = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fokus kembali ke tombol PortoBot setelah panel ditutup, supaya pengguna
  // keyboard tidak terjatuh ke <body> dan kehilangan tempatnya.
  useEffect(() => {
    if (wasBotOpen.current && !botOpen) botRef.current?.focus();
    wasBotOpen.current = botOpen;
  }, [botOpen]);

  if (HOME_ROUTE.test(pathname)) return null;

  if (!mounted) {
    return <div className="fixed right-6 bottom-6 z-40" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleThemeDebounced = () => {
    if (toggling) return;
    setToggling(true);
    toggleTheme();
    setTimeout(() => setToggling(false), 200);
  };

  const activate = (index: 0 | 1) => {
    if (index === 0) toggleThemeDebounced();
    else setBotOpen((open) => !open);
  };

  const focusSegment = (index: 0 | 1) => {
    setFocused(index);
    (index === 0 ? themeRef : botRef).current?.focus();
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SEGMENT_WIDTH / 2) activate(1);
    else if (info.offset.x < -SEGMENT_WIDTH / 2) activate(0);

    if (prefersReducedMotion) dragX.set(0);
    else animate(dragX, 0, SNAP);
  };

  return (
    // Scrim ditumpuk lebih dulu di dalam wrapper yang sama, jadi ia menutupi
    // viewport di bawah pill tanpa menutupi navbar (z-50) di atasnya.
    <div className="fixed right-6 bottom-6 z-40">
      {botOpen ? (
        <div
          aria-hidden="true"
          onClick={() => setBotOpen(false)}
          className="fixed inset-0"
        />
      ) : null}

      <AnimatePresence>
        {botOpen ? (
          <PortoBot variant="panel" open onClose={() => setBotOpen(false)} />
        ) : null}
      </AnimatePresence>

      <motion.div
        role="radiogroup"
        aria-label="Site controls"
        drag={prefersReducedMotion ? false : "x"}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className="grid h-14 w-28 grid-cols-2 place-items-center rounded-full border border-white/10 bg-bg-secondary/80 p-1 shadow-2xl backdrop-blur-md"
      >
        <motion.span
          layoutId="switcher-indicator"
          aria-hidden="true"
          className="absolute left-1 top-1 h-12 w-14 rounded-full border border-accent/30 bg-accent/10"
          style={prefersReducedMotion ? { x: botOpen ? SEGMENT_WIDTH : 0 } : undefined}
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: botOpen ? SEGMENT_WIDTH : 0 }}
          transition={prefersReducedMotion ? undefined : SNAP}
        />

        <button
          ref={themeRef}
          type="button"
          role="radio"
          aria-checked={!botOpen}
          aria-label="Toggle theme"
          aria-busy={toggling}
          tabIndex={focused === 0 ? 0 : -1}
          onClick={() => activate(0)}
          onFocus={() => setFocused(0)}
          className="group relative z-10 flex h-12 w-14 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isDark ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-accent" />}
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
            {isDark ? "Switch to Light" : "Switch to Dark"}
          </span>
        </button>

        <button
          ref={botRef}
          type="button"
          role="radio"
          aria-checked={botOpen}
          aria-label="PortoBot"
          tabIndex={focused === 1 ? 0 : -1}
          onClick={() => activate(1)}
          onFocus={() => setFocused(1)}
          onKeyDown={(event) => {
            // Panah/Home/End hanya memindahkan fokus (aktivasi manual), Enter dan
            // Space yang memilih — supaya menyorot tombol Tema tidak ikut
            // mengganti tema tanpa sengaja.
            if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "End") {
              event.preventDefault();
              focusSegment(1);
            } else if (
              event.key === "ArrowLeft" ||
              event.key === "ArrowUp" ||
              event.key === "Home"
            ) {
              event.preventDefault();
              focusSegment(0);
            }
          }}
          className="group relative z-10 flex h-12 w-14 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-accent"
        >
          <MessageCircle className="h-5 w-5 text-accent" />
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
            PortoBot
          </span>
        </button>
      </motion.div>
    </div>
  );
}
