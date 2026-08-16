import { beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "@/stores/theme-store";

describe("theme store", () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: "dark", resolvedTheme: "dark" });
  });

  it("defaults to dark theme", () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe("dark");
    expect(state.resolvedTheme).toBe("dark");
  });

  it("sets the theme", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("sets the resolved theme", () => {
    useThemeStore.getState().setResolvedTheme("light");
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
  });

  it("keeps theme and resolvedTheme independent", () => {
    useThemeStore.getState().setTheme("system");
    expect(useThemeStore.getState().theme).toBe("system");
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
  });
});
