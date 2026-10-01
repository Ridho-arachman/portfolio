"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HOME_ROUTE = /^\/(en|id)\/?$/;
const CHROME_CLASS = "ascend-chrome";

/**
 * The public Navbar/Footer live in the layout, outside the home page's
 * `ascend-theme` wrapper, so they would keep the violet/light palette over the
 * deep-space hero. Rather than duplicate those components for one route, this
 * sets a marker class on <html> and lets globals.css re-point the shared
 * design tokens at the Ascend palette for that route only.
 */
export function AscendChrome() {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.documentElement;
    const apply = () => {
      el.classList.toggle(CHROME_CLASS, HOME_ROUTE.test(pathname));
    };
    apply();
    return () => el.classList.remove(CHROME_CLASS);
  }, [pathname]);

  return null;
}