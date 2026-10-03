import { Vector3 } from "three";

export const ASSET_BASE_URL =
    "https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2";

export const PLANET_GLB = `${ASSET_BASE_URL}/planet.glb`;
export const PLANET_LIGHTS_GLB = `${ASSET_BASE_URL}/planet-lights.glb`;
export const PLANET_CLOUDS_PNG = `${ASSET_BASE_URL}/planet-clouds.png`;
export const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";

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

export const ENTRY_DUR = 1.9;
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

/* -------------------------------------------------------------- mobile quality tier */

// ponytail: mobile particle budget. Ceiling: 45% fewer points — motes and stars read as
// texture, not geometry, at phone resolution. Upgrade path: per-device benchmark tier.
export const MOBILE_PARTICLE_SCALE = 0.55;

// ponytail: mobile pixel-ratio ceiling. Ceiling: on a 3x phone the globe renders at
// 0.75 device pixels per CSS pixel, so it looks soft — that is the deliberate trade for
// hitting 60fps on weak mobile GPUs (Adreno 610-class fill rate), not a bug. Upgrade path:
// per-device benchmark tier that raises this when headroom allows.
export const MOBILE_MAX_PIXEL_RATIO = 0.75;

// ponytail: mobile cap for the planet GLTF's own albedo texture. The source is 6000x6000
// and three.js resizes it down to the device MAX_TEXTURE_SIZE anyway, which is still
// 4096x4096 = ~67MB of VRAM — brutal on a 4GB phone. The globe is only ~300px on screen,
// so 1024 is already past the point of visible detail. Ceiling: faint softening on a
// zoomed-in globe. Upgrade path: ship a 1024 asset instead of downscaling at runtime.
export const MOBILE_PLANET_TEXTURE_SIZE = 1024;

// ponytail: mobile cloud-shell tessellation. Ceiling: visible faceting on the cloud rim
// at phone size (silhouette only — the shells are soft alpha, no hard edge).
// Upgrade path: raise to 32 once a mid-range device is verified at 60fps.
export const MOBILE_CLOUD_SEGMENTS = 24;

/** Cloud shell segments for the current tier. Desktop returns `n` untouched. */
export function cloudSegments(n: number, mobile: boolean): number {
    return mobile ? MOBILE_CLOUD_SEGMENTS : n;
}

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

/** Point budget for the current tier. Desktop returns `n` untouched. */
export function scaleCount(n: number, mobile: boolean): number {
    return mobile ? Math.round(n * MOBILE_PARTICLE_SCALE) : n;
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
