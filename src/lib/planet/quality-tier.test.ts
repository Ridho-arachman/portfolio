import { afterEach, describe, expect, it, vi } from "vitest";
import {
    CONFIG,
    DEMOTE_FRAME_MS,
    DEMOTE_LATE_RATIO,
    isMobileViewport,
    MOBILE_DEMOTED_PIXEL_RATIO,
    MOBILE_MAX_PIXEL_RATIO,
    MOBILE_PARTICLE_SCALE,
    scaleCount,
} from "./config";

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

describe("adaptive mobile demotion", () => {
    it("orders the tiers so the demotion actually reduces pixel work", () => {
        expect(MOBILE_DEMOTED_PIXEL_RATIO).toBeLessThan(MOBILE_MAX_PIXEL_RATIO);
    });

    it("keeps both tiers at or below 1 so the canvas never oversamples", () => {
        expect(MOBILE_MAX_PIXEL_RATIO).toBeLessThanOrEqual(1);
        expect(MOBILE_DEMOTED_PIXEL_RATIO).toBeLessThanOrEqual(1);
    });

    it("demotes below 50fps, not below the 60fps target", () => {
        // 16.7ms is one 60Hz vsync. A phone averaging worse than 20ms is already under 50fps,
        // so waiting for a worse reading would only ship visible judder to good phones.
        expect(DEMOTE_FRAME_MS).toBeGreaterThan(16.7);
        expect(DEMOTE_FRAME_MS).toBeLessThanOrEqual(25);
    });

    it("judges judder by the share of late frames, not the mean", () => {
        // A phone can vsync-lock most frames while still dropping a quarter of them; its mean
        // frame time then looks fine and a mean-based test would never demote it.
        expect(DEMOTE_LATE_RATIO).toBeGreaterThan(0);
        expect(DEMOTE_LATE_RATIO).toBeLessThanOrEqual(0.5);
    });
});