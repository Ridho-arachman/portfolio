import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";
import { useThemeStore } from "@/stores/theme-store";

const pathnameMock = vi.hoisted(() => ({ value: "/en" }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.value,
}));

function Probe() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("light")}>set light</button>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    pathnameMock.value = "/en";
    useThemeStore.setState({ theme: "dark", resolvedTheme: "dark" });
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.style.colorScheme = "";
  });

  it("defaults to dark and applies it to the document element", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("uses the persisted theme from localStorage and keeps the store in sync", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(useThemeStore.getState().theme).toBe("light");
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
  });

  it("falls back to default when localStorage holds an unknown value", () => {
    localStorage.setItem("theme", "system");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("setTheme applies the class, persists it and updates the store", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set light" }));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("toggleTheme flips between dark and light", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("re-applies the stored theme when the route changes", () => {
    const { rerender } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set light" }));
    expect(document.documentElement.classList.contains("light")).toBe(true);

    document.documentElement.classList.remove("light", "dark");
    pathnameMock.value = "/id";
    rerender(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("useTheme throws outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(
      "useTheme must be used within <ThemeProvider>",
    );
  });
});