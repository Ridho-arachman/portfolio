import { create } from "zustand";

type Theme = "dark" | "light" | "system";

interface ThemeStore {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: "dark" | "light") => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  resolvedTheme: "dark",

  setTheme: (theme: Theme) => set({ theme }),
  setResolvedTheme: (resolvedTheme: "dark" | "light") => set({ resolvedTheme }),
}));
