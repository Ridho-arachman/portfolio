// Split out of config.ts because config.ts imports `Vector3` from three: a server
// component can only preload these URLs by importing them from a module that does not
// drag the renderer in. config.ts re-exports them, so every existing import is unchanged.
export const ASSET_BASE_URL = "/planet/v1";

export const PLANET_GLB = `${ASSET_BASE_URL}/planet.glb`;
export const PLANET_LIGHTS_GLB = `${ASSET_BASE_URL}/planet-lights.glb`;
export const PLANET_CLOUDS_PNG = `${ASSET_BASE_URL}/planet-clouds.webp`;

// Still third-party: DRACO ships its decoder from Google's CDN, which already serves it
// immutable, so self-hosting ~390KB of binary buys nothing.
export const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";