import { afterEach, describe, expect, it, vi } from "vitest";
import { CONFIG, isMobileViewport, MOBILE_PARTICLE_SCALE, scaleCount } from "./config";

const stubMedia = (coarse: boolean, narrow: boolean): void => {
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query.includes("pointer: coarse") ? coarse : narrow,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }));
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("isMobileViewport", () => {
    it("is true only for a coarse pointer on a narrow viewport", () => {
        stubMedia(true, true);
        expect(isMobileViewport()).toBe(true);
    });

    it("rejects a coarse pointer on a wide viewport (touchscreen laptop)", () => {
        stubMedia(true, false);
        expect(isMobileViewport()).toBe(false);
    });

    it("rejects a narrow fine-pointer viewport (narrow desktop window)", () => {
        stubMedia(false, true);
        expect(isMobileViewport()).toBe(false);
    });

    it("rejects a wide fine-pointer viewport (desktop)", () => {
        stubMedia(false, false);
        expect(isMobileViewport()).toBe(false);
    });

    it("is false when matchMedia is unavailable (SSR, no DOM)", () => {
        vi.stubGlobal("matchMedia", undefined);
        expect(isMobileViewport()).toBe(false);
    });
});

describe("scaleCount", () => {
    const budgets = [
        ["atmoCount", CONFIG.atmoCount],
        ["starCount", CONFIG.starCount],
        ["markerCount", CONFIG.markerCount],
    ] as const;

    it.each(budgets)("leaves %s untouched on desktop", (_name, configured) => {
        expect(scaleCount(configured, false)).toBe(configured);
    });

    it.each(budgets)("scales %s down on mobile", (_name, configured) => {
        expect(scaleCount(configured, true)).toBe(Math.round(configured * MOBILE_PARTICLE_SCALE));
    });

    it.each(budgets)("reduces %s meaningfully on mobile", (_name, configured) => {
        const scaled = scaleCount(configured, true);
        expect(scaled).toBeGreaterThan(0);
        expect(scaled).toBeLessThan(configured);
    });
});