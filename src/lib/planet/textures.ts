import { Mesh, MeshStandardMaterial, Object3D, Texture } from "three";

/** A decoded texture source the GLTF/image loaders hand back. */
export type DrawableSource = HTMLImageElement | HTMLCanvasElement;

/** Everything `drawImage` accepts here: the clouds PNG's `ImageBitmap`, or a GLTF texture's image. */
type ResizeSource = ImageBitmap | DrawableSource;

export function isDrawableSource(value: unknown): value is DrawableSource {
    return (
        (typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== "undefined" && value instanceof HTMLCanvasElement)
    );
}

/**
 * The single downscale implementation: draws `source` into a canvas whose longest edge is at
 * most `maxSize`. Both entry points — fetching a PNG and capping an already-decoded GLTF
 * texture — go through here, so there is only ever one resize to keep correct.
 */
function drawScaled(source: ResizeSource, maxSize: number): HTMLCanvasElement {
    const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("planet: 2d context unavailable");
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
}

// ponytail: the source clouds PNG is 6000x6000 and decoding/uploading that costs seconds of
// main-thread time on a throttled phone; createImageBitmap resizes off-thread instead. Ceiling
// = 2048 cap (still denser than the ~500px globe). Upgrade path: ship a 2048 asset.
export async function loadScaledTexture(url: string, maxSize: number): Promise<Texture> {
    const bitmap = await createImageBitmap(await (await fetch(url)).blob());
    const canvas = drawScaled(bitmap, maxSize);
    bitmap.close();
    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

/**
 * Returns a copy of `texture` whose longest edge is at most `maxSize`, or `texture` *itself*
 * when there is nothing to gain (no drawable source, or already within the cap). Returning
 * the identity means callers never need a "did it change?" check.
 *
 * Every sampling and UV property is copied, because resampling with different wrap, filtering
 * or orientation changes the shading itself, not just the sharpness. (`encoding` is r143's
 * name for colour space; `colorSpace` only arrives in r152.)
 */
export function downscaleTexture(texture: Texture, maxSize: number): Texture {
    const image = texture.image;
    if (!isDrawableSource(image)) return texture;
    if (Math.max(image.width, image.height) <= maxSize) return texture;

    const scaled = new Texture(drawScaled(image, maxSize));
    scaled.encoding = texture.encoding;
    scaled.flipY = texture.flipY;
    scaled.wrapS = texture.wrapS;
    scaled.wrapT = texture.wrapT;
    scaled.magFilter = texture.magFilter;
    scaled.minFilter = texture.minFilter;
    scaled.generateMipmaps = texture.generateMipmaps;
    scaled.anisotropy = texture.anisotropy;
    scaled.premultiplyAlpha = texture.premultiplyAlpha;
    scaled.unpackAlignment = texture.unpackAlignment;
    scaled.offset.copy(texture.offset);
    scaled.repeat.copy(texture.repeat);
    scaled.center.copy(texture.center);
    scaled.rotation = texture.rotation;
    scaled.needsUpdate = true;

    // The replacement now holds the only reference that matters, so the original's GPU copy
    // can go: nothing else can still sample it.
    texture.dispose();
    return scaled;
}

/**
 * Swaps every oversized texture of `material` for a downscaled copy, in place. The texture
 * slots are plain own properties, so enumerating them covers `map`, `normalMap`,
 * `roughnessMap` and friends without a hard-coded slot list that can go stale.
 */
function capMaterialTextures(material: MeshStandardMaterial, maxSize: number): void {
    const slots = material as MeshStandardMaterial & Record<string, unknown>;
    for (const [slot, value] of Object.entries(slots)) {
        if (value instanceof Texture) slots[slot] = downscaleTexture(value, maxSize);
    }
}

/**
 * Caps every `MeshStandardMaterial` texture under `root` at `maxSize`.
 *
 * ponytail: three.js resizes an oversized texture down to the device `MAX_TEXTURE_SIZE` on
 * upload anyway, so the loader's 6000x6000 sources still land as 4096x4096 (~67MB of VRAM
 * each) and a 4GB phone runs out. Ceiling: a faint softening of terrain relief and cloud
 * detail. Upgrade path: ship 1024 assets instead of resizing at runtime.
 */
export function capSceneTextures(root: Object3D, maxSize: number): void {
    root.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        for (const material of [object.material].flat()) {
            if (material instanceof MeshStandardMaterial) capMaterialTextures(material, maxSize);
        }
    });
}