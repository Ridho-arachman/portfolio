import { render, screen, fireEvent } from "@testing-library/react";
import { LazyMotion, domAnimation } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MagneticButton } from "./magnetic-button";

/**
 * jsdom does not implement window.matchMedia. MagneticButton relies on
 * `(pointer: fine)` and motion's useReducedMotion relies on
 * `(prefers-reduced-motion: reduce)`, so both queries are mocked here.
 */
function setupMatchMedia(matches: Record<string, boolean>) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matches[query] ?? false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderButton() {
  return render(
    <LazyMotion features={domAnimation}>
      <MagneticButton>Magnetic CTA</MagneticButton>
    </LazyMotion>,
  );
}

describe("MagneticButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders its children as an accessible button", () => {
    setupMatchMedia({});

    renderButton();

    expect(
      screen.getByRole("button", { name: /magnetic cta/i }),
    ).toBeInTheDocument();
  });

  it("does not apply a magnetic transform on coarse pointers", () => {
    // Touch-first device: `(pointer: fine)` tidak terpenuhi.
    setupMatchMedia({ "(pointer: fine)": false });

    renderButton();
    const button = screen.getByRole("button", { name: /magnetic cta/i });

    fireEvent.mouseMove(button, { clientX: 40, clientY: 40 });

    expect(button.style.transform).not.toContain("translate");
  });

  it("does not apply a magnetic transform when prefers-reduced-motion", () => {
    setupMatchMedia({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": true,
    });

    renderButton();
    const button = screen.getByRole("button", { name: /magnetic cta/i });

    fireEvent.mouseMove(button, { clientX: 40, clientY: 40 });

    expect(button.style.transform).not.toContain("translate");
  });
});
