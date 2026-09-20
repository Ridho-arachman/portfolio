"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Rendered until the section approaches the viewport, preserving layout height. */
  placeholder?: ReactNode;
  /** Root margin that triggers render before the section is actually visible. */
  rootMargin?: string;
}

/**
 * Delays mounting `children` until the wrapper approaches the viewport.
 *
 * Below-fold sections (projects, certificates, contact) stay unloaded on
 * first paint, which cuts main-thread work, script execution and network
 * bytes during the critical path (Total Blocking Time / LCP). `placeholder`
 * keeps the page height stable so there is no layout shift while loading.
 */
export function LazySection({
  children,
  placeholder = null,
  rootMargin = "400px 0px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    // SSR: initial state stays `false` so server/client hydration matches (avoids React error #418).
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return <div ref={ref}>{visible ? children : placeholder}</div>;
}