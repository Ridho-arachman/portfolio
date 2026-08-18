"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "portfolio_session_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sessionId = getOrCreateSessionId();

    // Use sendBeacon for reliable delivery even on page unload
    const payload = JSON.stringify({ path: pathname, timezone, sessionId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/visit", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
