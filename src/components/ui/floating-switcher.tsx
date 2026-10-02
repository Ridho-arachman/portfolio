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
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Lebar satu segmen (w-14) — dipakai sebagai ambang tengah saat drag. */
const SEGMENT_WIDTH = 56;
const SNAP = { type: "spring", stiffness: 400, damping: 32 } as const;

/**
 * Home (`/en`, `/id`) tetap harus punya pill ini untuk PortoBot, tapi segmen
 * tema disembunyikan: semua warna home datang dari token `--color-ascend-*` yang
 * hardcoded dan tidak punya pasangan `.light`, plus `.ascend-chrome` yang memaksa
 * navbar/footer ikut gelap. Tombol tema di sana cuma kontrol yang kelihatan hidup
 * tanpa efek apa pun.
 */
const HOME_ROUTE = new RegExp(`^/(${LOCALES.join("|")})/?$`);

/** Admin tidak butuh PortoBot, dan tidak ada halaman publik di dalam `/admin`. */
const ADMIN_ROUTE = /^\/admin(\/|$)/;

/**
 * Pengganti ThemeToggleFloating: satu pill dua segmen (Tema | PortoBot) yang
 * bisa diklik, dicoret keyboard, atau diseret mendatar.
 *
 * Segmen PortoBot memanggil `useMessages()` lewat `PortoBot`, jadi pill yang
 * menampilkannya HANYA BOLEH dirender di dalam PublicContentProvider. Root
 * layout berada di atas provider itu, maka ia memakai `botEnabled={false}`
 * (hanya tema) dan halaman publik merender pill sendiri dari dalam provider.
 * `botEnabled` membuat `PortoBot` tidak pernah ter-mount, jadi tidak ada
 * yang bisa memanggil hook provider dari luar provider.
 */
export function FloatingSwitcher({ botEnabled = true }: { botEnabled?: boolean }) {
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

  const isHome = HOME_ROUTE.test(pathname);
  const isAdmin = ADMIN_ROUTE.test(pathname);

  // Di home hanya PortoBot, di admin hanya tema. Di jalur mana pun yang
  // tersisa (halaman publik lain) keduanya tampil dan bisa diseret.
  const showTheme = !isHome;
  const showBot = botEnabled && !isAdmin;

  // Fokus kembali ke tombol PortoBot setelah panel ditutup, supaya pengguna
  // keyboard tidak terjatuh ke <body> dan kehilangan tempatnya.
  useEffect(() => {
    if (wasBotOpen.current && !botOpen) botRef.current?.focus();
    wasBotOpen.current = botOpen;
  }, [botOpen]);

  // Navigasi client-side tidak me-remount root layout, jadi `botOpen` bisa
  // menyala false di `/admin`. Yang menentukan render tetap `botVisible`:
  // mutate state di dalam effect akan memicu cascading render.
  const botVisible = showBot && botOpen;

  if (!mounted) {
    return <div className="fixed right-6 bottom-6 z-40" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";
  const isDual = showTheme && showBot;
  const indicatorX = isDual && botOpen ? SEGMENT_WIDTH : 0;
  // Roving tabindex harus menunjuk segmen yang benar-benar ada, kalau tidak
  // `tabIndex={0}` jatuh ke tombol yang sudah di-unmount.
  const activeIndex = showTheme ? (showBot ? focused : 0) : 1;

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
    if (info.offset.x > SEGMENT_WIDTH / 2) {
      if (showBot) activate(1);
    } else if (info.offset.x < -SEGMENT_WIDTH / 2) {
      if (showTheme) activate(0);
    }

    if (prefersReducedMotion) dragX.set(0);
    else animate(dragX, 0, SNAP);
  };

  return (
    // Scrim ditumpuk lebih dulu di dalam wrapper yang sama, jadi ia menutupi
    // viewport di bawah pill tanpa menutupi navbar (z-50) di atasnya.
    <div className="fixed right-6 bottom-6 z-40">
      {botVisible ? (
        <div
          aria-hidden="true"
          onClick={() => setBotOpen(false)}
          className="fixed inset-0"
        />
      ) : null}

      <AnimatePresence>
        {botVisible ? (
          <PortoBot variant="panel" open onClose={() => setBotOpen(false)} />
        ) : null}
      </AnimatePresence>

      <motion.div
        role="radiogroup"
        aria-label="Site controls"
        drag={prefersReducedMotion || !isDual ? false : "x"}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className={cn(
          "grid h-14 place-items-center rounded-full border border-white/10 bg-bg-secondary/80 p-1 shadow-2xl backdrop-blur-md",
          isDual ? "w-28 grid-cols-2" : "w-14 grid-cols-1",
        )}
      >
        <motion.span
          layoutId="switcher-indicator"
          aria-hidden="true"
          className="absolute left-1 top-1 h-12 w-14 rounded-full border border-accent/30 bg-accent/10"
          style={prefersReducedMotion ? { x: indicatorX } : undefined}
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: indicatorX }}
          transition={prefersReducedMotion ? undefined : SNAP}
        />

        {showTheme ? (
          <button
            ref={themeRef}
            type="button"
            role="radio"
            aria-checked={!showBot || !botOpen}
            aria-label="Toggle theme"
            aria-busy={toggling}
            tabIndex={activeIndex === 0 ? 0 : -1}
            onClick={() => activate(0)}
            onFocus={() => setFocused(0)}
            className="group relative z-10 flex h-12 w-14 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isDark ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-accent" />}
            <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
              {isDark ? "Switch to Light" : "Switch to Dark"}
            </span>
          </button>
        ) : null}

        {showBot ? (
          <button
            ref={botRef}
            type="button"
            role="radio"
            aria-checked={!showTheme || botOpen}
            aria-label="PortoBot"
            tabIndex={activeIndex === 1 ? 0 : -1}
            onClick={() => activate(1)}
            onFocus={() => setFocused(1)}
            onKeyDown={(event) => {
              // Panah/Home/End hanya memindahkan fokus (aktivasi manual), Enter dan
              // Space yang memilih — supaya menyorot tombol Tema tidak ikut
              // mengganti tema tanpa sengaja. Kalau hanya satu segmen yang ada,
              // `preventDefault()` di sini akan memblokir scroll halaman.
              if (!isDual) return;
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
        ) : null}
      </motion.div>
    </div>
  );
}
