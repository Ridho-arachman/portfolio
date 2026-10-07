"use client";

// Turnstile widget (Cloudflare CAPTCHA).
// Render eksplisit: script dimuat manual lalu widget di-render ke div ref.
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    let cancelled = false;
    let script: HTMLScriptElement | null = null;
    let started = false;
    let retries = 0;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        // The site is always dark; "auto" does not pick that up and the widget
        // renders as a light, un-themed box on a dark page.
        theme: "dark",
        callback: (token: string) => onToken(token),
        "expired-callback": () => {
          onToken("");
          onExpire?.();
        },
        "error-callback": () => {
          onToken("");
          onExpire?.();
          // On mobile the challenge can fail transiently when it starts mid-scroll.
          // Turnstile's own auto-retry gives up eventually and leaves a dead error
          // box, so re-render once ourselves.
          if (!cancelled && retries < 1) {
            retries += 1;
            window.setTimeout(() => {
              if (cancelled || !window.turnstile || !widgetIdRef.current)
                return;
              window.turnstile.remove(widgetIdRef.current);
              widgetIdRef.current = null;
              renderWidget();
            }, 1500);
          }
        },
      });
    };

    const start = () => {
      if (started) return;
      started = true;
      if (window.turnstile) {
        renderWidget();
      } else if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      }
    };

    // Start the challenge only once the widget is actually on screen and laid
    // out: starting it while the container is still below the fold (home mounts
    // the whole below-fold chunk ~200px early via LazySection) makes the mobile
    // challenge fail and stick in an error state.
    const el = containerRef.current;
    const maybeStart = () => {
      const rect = el.getBoundingClientRect();
      if (el.clientWidth > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
        start();
        return true;
      }
      return false;
    };

    let io: IntersectionObserver | null = null;
    if (!maybeStart()) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && maybeStart()) {
            io?.disconnect();
          }
        },
        { threshold: 0 },
      );
      io.observe(el);
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken, onExpire]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="flex w-full justify-center" />;
}
