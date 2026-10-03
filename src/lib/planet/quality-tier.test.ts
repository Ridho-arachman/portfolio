import { afterEach, describe, expect, it, vi } from "vitest";
import {
    CONFIG,
    DEMOTE_FRAME_MS,
    DEMOTE_LATE_RATIO,
    DEMOTE_SAMPLE_COUNT,
    DEMOTE_WARMUP_MS,
    DESKTOP_PROFILE,
    isMobileViewport,
    MOBILE_DEMOTED_PROFILE,
    MOBILE_PLANET_TEXTURE_SIZE,
    MOBILE_PROFILE,
    particleCount,
    resolveProfile,
    SCROLL_SETTLE_MS,
} from "./config";

/**
 * Mirrors `resolvePixelRatio`'s `null` contract for the invariant assertions below: a tier
 * that declares no bound of its own is bounded by nothing.
 */
const bound = (value: number | null): number => value ?? Number.POSITIVE_INFINITY;

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

describe("quality profiles", () => {
    // These two are deliberate byte-identity guards on the tier table. They are written as
    // literals, not derived from CONFIG, so any future retune of a knob turns into a failing
    // assertion someone has to read and accept instead of a silently changed budget.

    it("pins the desktop tier to native DPR, full quality and no downgrades", () => {
        expect(DESKTOP_PROFILE).toEqual({
            pixelRatio: null,
            particleScale: 1,
            cloudSegments: 64,
            planetTextureSize: null,
            bloomPasses: 2,
            scrollPixelRatio: null,
        });
    });

    it("pins the mobile tier to the capped phone budget", () => {
        expect(MOBILE_PROFILE).toEqual({
            pixelRatio: 0.75,
            particleScale: 0.55,
            cloudSegments: 24,
            planetTextureSize: 1024,
            bloomPasses: 0,
            scrollPixelRatio: 0.5,
        });
    });

    it("ties the mobile texture cap to the constant the texture tests assert on", () => {
        // textures.test.ts exercises the downscaler at MOBILE_PLANET_TEXTURE_SIZE. If the
        // profile ever inlined a different number, those tests would keep passing while
        // testing a cap the scene no longer applies.
        expect(MOBILE_PROFILE.planetTextureSize).toBe(MOBILE_PLANET_TEXTURE_SIZE);
    });

    it("separates desktop from mobile on every knob at once", () => {
        for (const key of Object.keys(DESKTOP_PROFILE) as (keyof typeof DESKTOP_PROFILE)[]) {
            expect(MOBILE_PROFILE[key]).not.toBe(DESKTOP_PROFILE[key]);
        }
    });

    it("gives the demoted tier exactly the baseline phone budget with a lower pixelRatio", () => {
        expect({ ...MOBILE_DEMOTED_PROFILE, pixelRatio: MOBILE_PROFILE.pixelRatio }).toEqual(
            MOBILE_PROFILE,
        );
        expect(MOBILE_DEMOTED_PROFILE.pixelRatio).toBe(0.5);
    });
});

describe("resolveProfile", () => {
    it("maps desktop to the desktop tier, demotion flag or not", () => {
        // Desktop has no second tier, so a stale flag must never demote it.
        expect(resolveProfile({ mobile: false, demoted: false })).toBe(DESKTOP_PROFILE);
        expect(resolveProfile({ mobile: false, demoted: true })).toBe(DESKTOP_PROFILE);
    });

    it("maps an unmeasured phone to the baseline tier", () => {
        expect(resolveProfile({ mobile: true, demoted: false })).toBe(MOBILE_PROFILE);
    });

    it("maps a demoted phone to the demoted tier", () => {
        expect(resolveProfile({ mobile: true, demoted: true })).toBe(MOBILE_DEMOTED_PROFILE);
    });
});

describe("particleCount", () => {
    const budgets = [
        ["atmoCount", CONFIG.atmoCount],
        ["starCount", CONFIG.starCount],
        ["markerCount", CONFIG.markerCount],
    ] as const;

    it.each(budgets)("leaves %s untouched on desktop", (_name, configured) => {
        expect(particleCount(configured, DESKTOP_PROFILE)).toBe(configured);
    });

    it.each(budgets)("scales %s down on mobile", (_name, configured) => {
        expect(particleCount(configured, MOBILE_PROFILE)).toBe(
            Math.round(configured * MOBILE_PROFILE.particleScale),
        );
    });

    it.each(budgets)("reduces %s meaningfully on mobile", (_name, configured) => {
        const scaled = particleCount(configured, MOBILE_PROFILE);
        expect(scaled).toBeGreaterThan(0);
        expect(scaled).toBeLessThan(configured);
    });

    it("scales by the demoted tier too", () => {
        // Both phone tiers declare the same particleScale, so this asserts the scene's
        // `count()` keeps working after the demotion swaps the profile mid-loop.
        expect(particleCount(CONFIG.starCount, MOBILE_DEMOTED_PROFILE)).toBe(
            particleCount(CONFIG.starCount, MOBILE_PROFILE),
        );
    });
});

describe("adaptive mobile demotion", () => {
    it("orders the tiers so the demotion actually reduces pixel work", () => {
        expect(bound(MOBILE_DEMOTED_PROFILE.pixelRatio)).toBeLessThan(
            bound(MOBILE_PROFILE.pixelRatio),
        );
    });

    it("keeps both tiers at or below 1 so the canvas never oversamples", () => {
        expect(bound(MOBILE_PROFILE.pixelRatio)).toBeLessThanOrEqual(1);
        expect(bound(MOBILE_DEMOTED_PROFILE.pixelRatio)).toBeLessThanOrEqual(1);
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

    it("averages enough frames for a quarter-share estimate to mean anything", () => {
        // The test is a ratio, so a handful of samples would swing between 0% and 100% late
        // and demote or spare a phone on noise alone.
        expect(DEMOTE_SAMPLE_COUNT).toBeGreaterThanOrEqual(30);
    });

    it("waits for the page to settle before judging the device", () => {
        // Judging during texture decode and hydration reads a busy load as a weak GPU, which
        // is how this ladder used to freeze the globe on phones that were perfectly capable.
        expect(DEMOTE_WARMUP_MS).toBeGreaterThanOrEqual(1000);
    });

    it("spends resolution only while a scroll is in flight", () => {
        // The scroll ratio must be the cheapest step available, and the settle window must be
        // short enough that the sharpness comes straight back once the user stops.
        expect(bound(MOBILE_PROFILE.scrollPixelRatio)).toBeLessThan(
            bound(MOBILE_PROFILE.pixelRatio),
        );
        expect(SCROLL_SETTLE_MS).toBeGreaterThanOrEqual(100);
        expect(SCROLL_SETTLE_MS).toBeLessThanOrEqual(400);
    });

    it("never trades resolution mid-scroll on desktop", () => {
        expect(DESKTOP_PROFILE.scrollPixelRatio).toBeNull();
    });
});
