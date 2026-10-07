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
        },
      });
    };

    const start = () => {
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

    // Turnstile renders as a blank white box when it mounts while its container
    // still has no layout (hidden, animated, or inside a lazy placeholder). Wait
    // until the container actually has a non-zero width before loading/rendering.
    let measured = false;
    const io = new ResizeObserver(() => {
      if (measured) return;
      const el = containerRef.current;
      if (!el) return;
      if (el.clientWidth > 0) {
        measured = true;
        start();
        io.disconnect();
      }
    });
    if (containerRef.current) io.observe(containerRef.current);

    return () => {
      cancelled = true;
      io.disconnect();
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken, onExpire]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
