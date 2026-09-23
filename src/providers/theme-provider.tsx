"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useThemeStore } from "@/stores/theme-store";

const STORAGE_KEY = "theme";
const THEMES = ["light", "dark"] as const;

type Theme = (typeof THEMES)[number];

interface ThemeProviderProps {
  children: ReactNode;
  /** Disable all CSS transitions while switching themes. */
  disableTransitionOnChange?: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

// Applies the theme to <html> exactly like next-themes did for
// attribute="class" + enableColorScheme, with enableSystem disabled.
function applyTheme(theme: Theme) {
  const el = document.documentElement;
  el.classList.remove(...THEMES);
  el.classList.add(theme);
  el.style.colorScheme = theme;
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // localStorage unavailable (privacy mode, etc.) - fall back to dark.
  }
  return "dark";
}

export function ThemeProvider({
  children,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // The zustand store is the source of truth; its "dark" default matches the
  // server render so hydration stays stable. The persisted theme is applied
  // once on mount (FOUC is already prevented by the <head> script in layout).
  const theme = useThemeStore((s) => s.theme as Theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setStoreTheme = useThemeStore((s) => s.setTheme);
  const setStoreResolvedTheme = useThemeStore((s) => s.setResolvedTheme);
  const transitionStyleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const initial = readStoredTheme();
    applyTheme(initial);
    setStoreTheme(initial);
    setStoreResolvedTheme(initial);
  }, [setStoreTheme, setStoreResolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      if (disableTransitionOnChange && !transitionStyleRef.current) {
        const style = document.createElement("style");
        style.textContent = "*{transition:none!important}";
        document.head.appendChild(style);
        transitionStyleRef.current = style;
      }
      applyTheme(next);
      setStoreTheme(next);
      setStoreResolvedTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore quota/privacy errors; theme still applies for this session.
      }
    },
    [disableTransitionOnChange, setStoreTheme, setStoreResolvedTheme],
  );

  // Remove the transition-blocking style shortly after the class swap.
  useEffect(() => {
    if (!transitionStyleRef.current) return;
    const style = transitionStyleRef.current;
    const cancel = requestAnimationFrame(() =>
      requestAnimationFrame(() => style.remove()),
    );
    return () => cancelAnimationFrame(cancel);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return {
    ...context,
    toggleTheme: () =>
      context.setTheme(context.resolvedTheme === "dark" ? "light" : "dark"),
  };
}