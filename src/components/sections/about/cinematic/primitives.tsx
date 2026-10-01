"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image, { type ImageProps } from "next/image";
import { animate, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const noopSubscribe = () => () => {};

/** `false` during SSR and the first client render, `true` afterwards. */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * True only once hydrated *and* the user asked for reduced motion.
 *
 * `useReducedMotion()` is false during SSR (no matchMedia) but true in the
 * browser, so branching on it directly makes server and client render
 * differently and React throws a hydration mismatch. Pairing it with the
 * hydration check makes the first client render match the server exactly; the
 * preference then applies through `animate`, which unlike `initial` keeps
 * re-asserting its target instead of only firing on mount.
 */
export function useStill() {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  return hydrated && reduce === true;
}

export function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />
      {children}
    </span>
  );
}

/** Fade + rise, played once on first entry. DESIGN.md 6: transform/opacity only. */
export function Reveal({
  children,
  index = 0,
  y = 30,
  stagger = 0.09,
  as = "div",
  className,
}: {
  children: React.ReactNode;
  index?: number;
  y?: number;
  stagger?: number;
  as?: "div" | "li";
  className?: string;
}) {
  const still = useStill();
  const Tag = as === "li" ? m.li : m.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      animate={still ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.56,
        ease: EASE_OUT_EXPO,
        delay: still ? 0 : index * stagger,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Reveals a heading one visual line at a time.
 *
 * Which words share a line depends on the container width and the locale's word
 * lengths, so the breaks are measured from a hidden flat copy rather than
 * hardcoded: render every word as an inline-block, read back its `offsetTop`,
 * and group consecutive words that share a top into one overflow-hidden row.
 * Re-measured on resize so a width change re-wraps correctly.
 */
export function RevealLines({
  text,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  onView = true,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** false = play on mount (hero only). true = wait for first entry. */
  onView?: boolean;
}) {
  const still = useStill();
  const probeRef = useRef<HTMLSpanElement>(null);
  const [rows, setRows] = useState<string[][] | null>(null);

  useLayoutEffect(() => {
    if (still) return;

    const measure = () => {
      const words = probeRef.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (!words?.length) return;

      const next: string[][] = [[]];
      let top = words[0]!.offsetTop;
      for (const word of words) {
        if (word.offsetTop !== top) {
          next.push([]);
          top = word.offsetTop;
        }
        next[next.length - 1]!.push(word.textContent ?? "");
      }
      setRows(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (probeRef.current) observer.observe(probeRef.current);
    return () => observer.disconnect();
  }, [text, className, still]);

  const words = text.split(" ");

  if (still) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={`relative ${className ?? ""}`}>
      <span className="sr-only">{text}</span>

      <span ref={probeRef} aria-hidden className="invisible absolute inset-0 block">
        {words.map((word, i) => (
          <span key={i} data-word className="inline-block">
            {word}
          </span>
        ))}
      </span>

      {rows?.map((row, i) => (
        <span key={i} aria-hidden className="block overflow-hidden">
          <m.span
            className={lineClassName}
            initial={{ y: "110%", opacity: 0 }}
            {...(onView
              ? { whileInView: { y: "0%", opacity: 1 }, viewport: { once: true, amount: 0.4 } }
              : { animate: { y: "0%", opacity: 1 } })}
            transition={{
              duration: 0.9,
              ease: EASE_OUT_EXPO,
              delay: still ? 0 : delay + i * stagger,
            }}
          >
            {row.join(" ")}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}

/** Rises each glyph from below its own clipping row. Screen readers get the whole line once. */
export function RevealLetters({
  lines,
  className,
  lineClassName = "block whitespace-nowrap",
  delay = 0,
  lineStagger = 0.24,
  letterStagger = 0.052,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  lineStagger?: number;
  letterStagger?: number;
}) {
  const still = useStill();

  return (
    <span className={className} aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span key={line} className="block overflow-hidden">
          <span className="sr-only">{line}</span>
          <span aria-hidden className={lineClassName}>
            {line.split("").map((char, ci) => (
              <m.span
                key={`${li}-${ci}`}
                className="inline-block"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: still ? 0 : 0.9,
                  ease: EASE_OUT_EXPO,
                  delay: still ? 0 : delay + li * lineStagger + ci * letterStagger,
                }}
              >
                {char === " " ? "\u00a0" : char}
              </m.span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Portrait/cover with an SVG displacement filter that only runs while hovered.
 *
 * Resting state carries no `filter` at all: a scale of 1 is visually a no-op but
 * still costs a filter pass per image, which is the wrong trade with six of these
 * on one page. On enter, the turbulence frequency and displacement scale are
 * written straight onto the SVG nodes -- neither is animatable from CSS.
 */
export function LiquidImage({
  alt,
  maxScale = 28,
  className = "",
  veil = true,
  ...imageProps
}: {
  alt: string;
  maxScale?: number;
  className?: string;
  veil?: boolean;
} & Omit<ImageProps, "alt" | "className">) {
  const still = useStill();
  const filterId = useId().replace(/:/g, "");
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const [active, setActive] = useState(false);

  const distort = useCallback(
    (progress: number) => {
      const turbulence = turbulenceRef.current;
      const displacement = displacementRef.current;
      if (!turbulence || !displacement) return;
      turbulence.setAttribute("baseFrequency", String(0.009 + progress * 0.013));
      displacement.setAttribute("scale", String(1 + progress * (maxScale - 1)));
    },
    [maxScale],
  );

  const engage = useCallback(() => {
    if (still) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    setActive(true);
    animate(0, 1, {
      type: "spring",
      stiffness: 140,
      damping: 13,
      onUpdate: distort,
      onComplete: () => distort(0),
    });
  }, [distort, still]);

  const release = useCallback(() => {
    setActive(false);
    animate(1, 0, { duration: 0.4, ease: EASE_OUT_EXPO, onUpdate: distort });
  }, [distort]);

  // Reduced-motion users can still hover; make sure a filter left on from an
  // earlier interaction is torn down when the preference changes mid-session.
  useEffect(() => {
    if (!still || active) return;
    distort(0);
  }, [still, active, distort]);

  return (
    <figure
      className={`group/liquid relative overflow-hidden ${className}`}
      onPointerEnter={engage}
      onPointerLeave={release}
    >
      <svg aria-hidden className="absolute size-0" focusable="false">
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.009"
            numOctaves={2}
            result="noise"
          />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="noise"
            scale={1}
          />
        </filter>
      </svg>

      <Image
        alt={alt}
        {...imageProps}
        style={active && !still ? { filter: `url(#${filterId})` } : undefined}
        className={`object-cover ${active ? "grayscale-0" : "grayscale"} transition-[grayscale] duration-500 ease-out`}
      />

      {veil ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-bg-primary opacity-90 mix-blend-color transition-opacity duration-500 ease-out group-hover/liquid:opacity-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover/liquid:opacity-100"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, color-mix(in srgb, var(--color-accent) 35%, transparent) 50%, transparent 70%)",
            }}
          />
        </>
      ) : null}
    </figure>
  );
}