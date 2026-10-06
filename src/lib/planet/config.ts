import { Vector3 } from "three";

export { ASSET_BASE_URL, PLANET_GLB, PLANET_LIGHTS_GLB, PLANET_CLOUDS_PNG, DRACO_DECODER_PATH } from "./assets";

export const CONFIG = {
    rimColor: "#d9c8ff",
    rimPower: 2.4,
    nightLights: 10,
    terrainDepth: 0.33,
    terrainShade: 1.3,
    oceanGlint: 0.45,
    oceanDeep: 0.12,
    oceanFlow: 3,
    oceanFlowSpeed: 0.8,
    oceanFlowScale: 2.1,
    glowColor: "#7b4dff",
    glowIntensity: 3.35,
    planetRadius: 1.95,
    spin: 0.03,
    initRotation: 2.07,
    tilt: 0.37,
    autoRotate: 0,
    cloud1Height: 1.005,
    cloud1Opacity: 0.6,
    cloud1Spin: 0.06,
    cloud2Height: 1.03,
    cloud2Opacity: 0.5,
    cloud2Spin: 0.14,
    cloud3Height: 1.075,
    cloud3Opacity: 0.5,
    cloud3Spin: 0.1,
    bgColor: "#060618",
    // Corner flame (FinalPass) reads as a lighting artefact against the violet
    // background and bands badly in 8-bit, so it stays off.
    flameColor: "#6d3bff",
    flameColor2: "#c9b6ff",
    flameAmt: 0,
    atmoColor: "#b9a8ff",
    atmoCount: 320,
    atmoSize: 22,
    atmoSpeed: 0.8,
    starColor: "#cfe0ff",
    starCount: 1400,
    starSize: 1.6,
    starFlicker: 1,
    markerColor: "#ffd27a",
    markerCount: 60,
    markerSize: 16,
    markerSpeed: 0.5,
};

export const LAYERS = {
    NONE: 0,
    TORUS_SCENE: 1,
    BLOOM_SCENE: 2,
    ENTIRE_SCENE: 3,
};

/** One keyframe of a piecewise-smoothstep curve: `p` is normalised progress, `v` the value. */
export interface Stop {
    p: number;
    v: number;
}

export const STOPS_X: readonly Stop[] = [
    { p: 0, v: 0 },
    { p: 0.32, v: -3.1 },
    { p: 0.64, v: 3.2 },
    { p: 1, v: 0 },
];

export const STOPS_Y: readonly Stop[] = [
    { p: 0, v: -4.5 },
    { p: 0.32, v: 0.55 },
    { p: 0.64, v: 0.45 },
    { p: 1, v: 0.15 },
];

export const STOPS_S: readonly Stop[] = [
    { p: 0, v: 2.15 },
    { p: 0.32, v: 1.0 },
    { p: 0.64, v: 0.92 },
    { p: 1, v: 1.12 },
];

export const ENTRY_DUR = 1.1;
export const ENTRY_START_Y = -6.5;
export const STAR_SPHERE_RADIUS = 90;
export const MARKER_LIFT = 1.012;
export const CLOUD_GEOMETRY_SEGMENTS = 64;

// Scroll progress window over which the globe fades out. 0.08 lands just past
// the hero, 0.30 is fully gone before the features grid needs to be readable.
export const SCROLL_FADE_START = 0.08;
export const SCROLL_FADE_END = 0.3;

export function clamp(value: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, value));
}

export function Lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/** `#rrggbb` (or `#rgb`) to a normalised `THREE.Vector3`, matching the reference's naive parse. */
export function hexToVec3(hex: string): Vector3 {
    const digits = hex.replace("#", "");
    const packed =
        digits.length === 3
            ? digits
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : digits;
    const n = Number.parseInt(packed, 16);
    return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/* -------------------------------------------------------------- quality tiers */

/**
 * One row of the rendering cost model. Every quality knob the scene reads lives here, so
 * the whole tier system is one table instead of a `mobile ? A : B` at each call site.
 *
 * `null` always means "no override, use the native value":
 *  - `pixelRatio: null`         → the renderer's DPR (`window.devicePixelRatio`), unclamped
 *  - `planetTextureSize: null`  → do not cap the GLTF albedo textures
 *  - `scrollPixelRatio: null`   → never trade resolution for frame budget mid-scroll
 *
 * `bloomPasses` counts the offscreen composers drawn before the final one:
 * 2 = torus + bloom (desktop), 1 = torus only, 0 = the final composer alone (mobile).
 */
export interface QualityProfile {
    readonly pixelRatio: number | null;
    readonly particleScale: number;
    readonly cloudSegments: number;
    readonly planetTextureSize: number | null;
    readonly bloomPasses: 0 | 1 | 2;
    readonly scrollPixelRatio: number | null;
}

/** Full quality. Nothing is capped, capped down, or skipped anywhere. */
export const DESKTOP_PROFILE: QualityProfile = {
    pixelRatio: null,
    particleScale: 1,
    cloudSegments: CLOUD_GEOMETRY_SEGMENTS,
    planetTextureSize: null,
    bloomPasses: 2,
    scrollPixelRatio: null,
};

// ponytail: mobile cap for the planet GLTF's own albedo texture. The source is 6000x6000
// and three.js resizes it down to the device MAX_TEXTURE_SIZE anyway, which is still
// 4096x4096 = ~67MB of VRAM — brutal on a 4GB phone. The globe is only ~300px on screen,
// so 1024 is already past the point of visible detail. Ceiling: faint softening on a
// zoomed-in globe. Upgrade path: ship a 1024 asset instead of downscaling at runtime.
export const MOBILE_PLANET_TEXTURE_SIZE = 1024;

/**
 * Baseline phone tier, reached purely from a viewport probe.
 *
 * ponytail: mobile drops both offscreen chains. Nothing is ever assigned TORUS_SCENE, so
 * its RenderPass draws an empty scene and the gamma + UnrealBloom mip chain + copy after it
 * resolve black -- ~13 full-screen passes, ~9.9 Mpix/frame at the 0.76 Mpix mobile buffer,
 * for exactly zero image contribution. Ceiling: mobile gives up the marker halo. Upgrade
 * path: put real objects on TORUS_SCENE, then re-enable mobile and buy the budget back
 * with DPR instead.
 */
export const MOBILE_PROFILE: QualityProfile = {
    // ponytail: pixel-ratio ceiling. On a 3x phone the globe renders at 0.75 device pixels
    // per CSS pixel, so it looks soft — that is the deliberate trade for hitting 60fps on
    // weak mobile GPUs (Adreno 610-class fill rate), not a bug. Upgrade path: per-device
    // benchmark tier that raises this when headroom allows.
    pixelRatio: 0.75,
    // ponytail: particle budget. Ceiling: 45% fewer points — motes and stars read as texture,
    // not geometry, at phone resolution. Upgrade path: per-device benchmark tier.
    particleScale: 0.55,
    // ponytail: cloud-shell tessellation. Ceiling: visible faceting on the cloud rim at
    // phone size (silhouette only — the shells are soft alpha, no hard edge). Upgrade path:
    // raise to 32 once a mid-range device is verified at 60fps.
    cloudSegments: 24,
    planetTextureSize: MOBILE_PLANET_TEXTURE_SIZE,
    bloomPasses: 0,
    // Resolution held while a scroll gesture is in flight. Motion hides detail, so this buys
    // frame budget that the eye cannot tell is missing; the moment the page settles it is
    // given back. ponytail: cheapest step available — costs sharpness nobody sees, and it is
    // not a permanent downgrade, so a phone that scrolls fine never pays for it.
    scrollPixelRatio: 0.5,
};

/**
 * Second phone tier, for devices whose measured frame time cannot hold the budget at
 * `MOBILE_PROFILE.pixelRatio` (measured at runtime, applied once — see `resolveProfile`).
 *
 * ponytail: the demotion touches resolution and nothing else, so the ceiling is exactly the
 * one knob: the globe is clearly soft, roughly half the linear resolution, but tessellation,
 * the texture cap and the composer choice are untouched. Upgrade path: drop the final-pass
 * composer on weak devices and give the pixels back before touching resolution again.
 */
export const MOBILE_DEMOTED_PROFILE: QualityProfile = {
    ...MOBILE_PROFILE,
    pixelRatio: 0.5,
};

/**
 * The one place a tier is chosen. `demoted` only means anything on mobile — desktop has no
 * second tier, so it always resolves to `DESKTOP_PROFILE` no matter what the flag says.
 */
export function resolveProfile(input: { mobile: boolean; demoted: boolean }): QualityProfile {
    if (!input.mobile) return DESKTOP_PROFILE;
    return input.demoted ? MOBILE_DEMOTED_PROFILE : MOBILE_PROFILE;
}

/** Point budget for a tier. `DESKTOP_PROFILE.particleScale` of 1 makes this the identity. */
export function particleCount(n: number, profile: QualityProfile): number {
    return Math.round(n * profile.particleScale);
}

// Median frame time above which a phone is considered too slow, in ms. 20ms = 50fps, i.e.
// already below the 60fps target with no headroom for scroll work.
export const DEMOTE_FRAME_MS = 20;

// Frames to average before deciding. Long enough to skip the first-frame shader-compile
// spike, short enough that a good phone is never held back.
export const DEMOTE_SAMPLE_COUNT = 90;

// Share of frames allowed to miss the budget before the phone is judged to judder. A device
// that still locks most frames to vsync but drops a quarter of them reads as stuttery even
// though its average frame time looks fine, so the ratio — not the mean — is what we test.
export const DEMOTE_LATE_RATIO = 0.25;

// Quiet period before the first measurement. The opening of the page is texture decode
// plus hydration; judging from that window misreads a busy load as a weak GPU.
export const DEMOTE_WARMUP_MS = 2500;

// How long after the last scroll event the full resolution returns. Long enough that one
// gesture re-sizes the renderer once rather than on every scroll event.
export const SCROLL_SETTLE_MS = 180;

/**
 * True only for a coarse pointer on a narrow viewport. Both halves are required: a
 * touchscreen laptop is coarse but wide, a narrow desktop window is narrow but fine, and
 * only the intersection is a phone-sized frame budget. A missing `matchMedia` (SSR, unit
 * tests) is never mobile.
 */
export function isMobileViewport(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return (
        window.matchMedia("(pointer: coarse)").matches &&
        window.matchMedia("(max-width: 768px)").matches
    );
}

/** Piecewise smoothstep interpolation across keyframe stops. */
export function sample(stops: readonly Stop[], p: number): number {
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (p <= first.p) return first.v;
    if (p >= last.p) return last.v;
    for (let i = 1; i < stops.length; i += 1) {
        const b = stops[i];
        if (p <= b.p) {
            const a = stops[i - 1];
            const t = (p - a.p) / (b.p - a.p);
            return Lerp(a.v, b.v, t * t * (3 - 2 * t));
        }
    }
    return last.v;
}
