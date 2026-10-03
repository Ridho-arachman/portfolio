import {
    ClampToEdgeWrapping,
    DataTexture,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    RepeatWrapping,
    sRGBEncoding,
    Texture,
} from "three";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MOBILE_PLANET_TEXTURE_SIZE } from "./config";
import { capSceneTextures, downscaleTexture } from "./textures";

const drawImage = vi.fn();

beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        drawImage,
    } as unknown as CanvasRenderingContext2D);
});

/** A drawable texture source of a given size, without decoding any real image bytes. */
const imageOf = (width: number, height: number): HTMLImageElement => {
    const image = new Image();
    Object.defineProperty(image, "width", { value: width });
    Object.defineProperty(image, "height", { value: height });
    return image;
};

const textureOf = (width: number, height: number): Texture => new Texture(imageOf(width, height));

describe("downscaleTexture", () => {
    it("returns the same instance when the image is already within the cap", () => {
        const texture = textureOf(MOBILE_PLANET_TEXTURE_SIZE, MOBILE_PLANET_TEXTURE_SIZE);

        expect(downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE)).toBe(texture);
        expect(drawImage).not.toHaveBeenCalled();
    });

    it("returns the same instance when the longest edge is one pixel under the cap", () => {
        const texture = textureOf(MOBILE_PLANET_TEXTURE_SIZE - 1, 16);

        expect(downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE)).toBe(texture);
        expect(drawImage).not.toHaveBeenCalled();
    });

    it("leaves a non-drawable source (DataTexture) alone", () => {
        const texture = new DataTexture(new Uint8Array(4), 1, 1);

        expect(downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE)).toBe(texture);
        expect(drawImage).not.toHaveBeenCalled();
    });

    it("downsamples an oversized image to the cap on its longest edge", () => {
        const texture = textureOf(6000, 6000);

        const scaled = downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE);

        expect(scaled).not.toBe(texture);
        expect(scaled.image).toBeInstanceOf(HTMLCanvasElement);
        const canvas = scaled.image as HTMLCanvasElement;
        expect([canvas.width, canvas.height]).toEqual([
            MOBILE_PLANET_TEXTURE_SIZE,
            MOBILE_PLANET_TEXTURE_SIZE,
        ]);
        expect(drawImage).toHaveBeenCalledWith(texture.image, 0, 0, 1024, 1024);
    });

    it("keeps the aspect ratio of a non-square oversized image", () => {
        const scaled = downscaleTexture(textureOf(4000, 2000), MOBILE_PLANET_TEXTURE_SIZE);

        const canvas = scaled.image as HTMLCanvasElement;
        expect([canvas.width, canvas.height]).toEqual([MOBILE_PLANET_TEXTURE_SIZE, 512]);
    });

    it("carries over colour space, orientation, wrap and filtering", () => {
        const texture = textureOf(6000, 6000);
        texture.encoding = sRGBEncoding;
        texture.flipY = false;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = LinearFilter;
        texture.anisotropy = 8;
        texture.repeat.set(3, 3);

        const scaled = downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE);

        expect(scaled.encoding).toBe(sRGBEncoding);
        expect(scaled.flipY).toBe(false);
        expect(scaled.wrapS).toBe(RepeatWrapping);
        expect(scaled.wrapT).toBe(ClampToEdgeWrapping);
        expect(scaled.magFilter).toBe(LinearFilter);
        expect(scaled.anisotropy).toBe(8);
        expect(scaled.repeat.toArray()).toEqual([3, 3]);
        // `needsUpdate` is a write-only setter; it bumps `version`, which is what makes
        // three.js upload the new image.
        expect(scaled.version).toBeGreaterThan(0);
    });

    it("disposes the original once the replacement exists", () => {
        const texture = textureOf(6000, 6000);
        const disposed = vi.fn();
        texture.addEventListener("dispose", disposed);

        downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE);

        expect(disposed).toHaveBeenCalledTimes(1);
    });

    it("never disposes a texture it did not replace", () => {
        const texture = textureOf(512, 512);
        const disposed = vi.fn();
        texture.addEventListener("dispose", disposed);

        downscaleTexture(texture, MOBILE_PLANET_TEXTURE_SIZE);

        expect(disposed).not.toHaveBeenCalled();
    });
});

describe("capSceneTextures", () => {
    it("replaces the oversized map of a standard material", () => {
        const map = textureOf(6000, 6000);
        const mesh = new Mesh(undefined, new MeshStandardMaterial({ map }));

        capSceneTextures(mesh, MOBILE_PLANET_TEXTURE_SIZE);

        const material = mesh.material as MeshStandardMaterial;
        expect(material.map).not.toBe(map);
        expect((material.map?.image as HTMLCanvasElement).width).toBe(MOBILE_PLANET_TEXTURE_SIZE);
    });

    it("leaves a material whose map is already within the cap untouched", () => {
        const map = textureOf(1024, 1024);
        const mesh = new Mesh(undefined, new MeshStandardMaterial({ map }));

        capSceneTextures(mesh, MOBILE_PLANET_TEXTURE_SIZE);

        expect((mesh.material as MeshStandardMaterial).map).toBe(map);
    });

    it("leaves materials that are not MeshStandardMaterial alone", () => {
        const map = textureOf(6000, 6000);
        const mesh = new Mesh(undefined, new MeshBasicMaterial({ map }));

        capSceneTextures(mesh, MOBILE_PLANET_TEXTURE_SIZE);

        expect((mesh.material as MeshBasicMaterial).map).toBe(map);
    });
});