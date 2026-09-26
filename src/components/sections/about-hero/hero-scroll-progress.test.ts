import { describe, expect, it } from "vitest";

import { heroScrollProgress } from "./hero-scroll-progress";

const VIEWPORT = 940;
const HERO = 940;

describe("heroScrollProgress", () => {
  it("is 0 when the hero is untouched at the top of the page", () => {
    expect(heroScrollProgress(HERO, HERO, VIEWPORT)).toBe(0);
  });

  it("keeps the hero fully opaque on load", () => {
    const progress = heroScrollProgress(HERO, HERO, VIEWPORT);

    expect(Math.max(0, 1 - progress * 2)).toBe(1);
  });

  it("increases as the hero scrolls up out of view", () => {
    const top = heroScrollProgress(HERO, HERO, VIEWPORT);
    const middle = heroScrollProgress(HERO / 2, HERO, VIEWPORT);

    expect(middle).toBeGreaterThan(top);
  });

  it("fades the hero out by the time it has scrolled past", () => {
    expect(Math.max(0, 1 - heroScrollProgress(0, HERO, VIEWPORT) * 2)).toBe(0);
  });

  it("clamps to 0 when the hero is below the fold", () => {
    expect(heroScrollProgress(HERO * 2, HERO, VIEWPORT)).toBe(0);
  });

  it("clamps to 1 when the hero is far above the viewport", () => {
    expect(heroScrollProgress(-VIEWPORT * 5, HERO, VIEWPORT)).toBe(1);
  });

  it("does not divide by zero for a zero-height hero", () => {
    expect(Number.isFinite(heroScrollProgress(VIEWPORT, 0, VIEWPORT))).toBe(true);
  });
});
