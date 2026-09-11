import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MagneticButton } from "./magnetic-button";

/**
 * jsdom does not implement window.matchMedia. MagneticButton relies on
 * `(pointer: fine)`, so the query is mocked here.
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
  return render(<MagneticButton>Magnetic CTA</MagneticButton>);
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

    // On coarse pointers, transform should be 0 (no magnetic effect)
    expect(button.style.transform).toBe("translate(0px, 0px)");
  });

  it("applies a magnetic transform on fine pointers", () => {
    setupMatchMedia({ "(pointer: fine)": true });

    renderButton();
    const button = screen.getByRole("button", { name: /magnetic cta/i });

    fireEvent.mouseMove(button, { clientX: 40, clientY: 40 });

    expect(button.style.transform).toContain("translate");
  });
});
