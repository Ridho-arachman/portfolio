"use client";

import { useThemeStore } from "@/stores/theme-store";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { useEffect, type ComponentProps } from "react";

// Infer the props directly from the NextThemesProvider component
type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

// Internal component to sync next-themes with Zustand
function ThemeSync() {
  const { theme, resolvedTheme } = useNextTheme();
  const { setTheme, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    if (theme) {
      setTheme(theme as "dark" | "light" | "system");
    }
    if (resolvedTheme) {
      setResolvedTheme(resolvedTheme as "dark" | "light");
    }
  }, [theme, resolvedTheme, setTheme, setResolvedTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}

// Custom hook that uses Zustand (more flexible)
export function useTheme() {
  const { theme, resolvedTheme } = useThemeStore();
  const nextTheme = useNextTheme();

  return {
    theme,
    resolvedTheme,
    setTheme: nextTheme.setTheme,
    // Add custom methods if needed
    toggleTheme: () => {
      nextTheme.setTheme(resolvedTheme === "dark" ? "light" : "dark");
    },
  };
}
