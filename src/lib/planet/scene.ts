import {
    AdditiveBlending,
    AmbientLight,
    BufferAttribute,
    BufferGeometry,
    Color,
    DataTexture,
    DirectionalLight,
    DoubleSide,
    Group,
    Material,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    PlaneGeometry,
    Points,
    RGBAFormat,
    RepeatWrapping,
    Scene,
    ShaderMaterial,
    SphereGeometry,
    sRGBEncoding,
    Texture,
    Vector2,
    VSMShadowMap,
    WebGL1Renderer,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import {
CLOUD_GEOMETRY_SEGMENTS,
    cloudSegments,
    clamp,
    CONFIG,
    DRACO_DECODER_PATH,
    ENTRY_DUR,
    ENTRY_START_Y,
    hexToVec3,
    isMobileViewport,
    LAYERS,
    MARKER_LIFT,
    MOBILE_MAX_PIXEL_RATIO,
    PLANET_CLOUDS_PNG,
    PLANET_GLB,
    PLANET_LIGHTS_GLB,
    sample,
    scaleCount,
    SCROLL_FADE_END,
    SCROLL_FADE_START,
    STAR_SPHERE_RADIUS,
    STOPS_S,
    STOPS_X,
    STOPS_Y,
} from "./config";
import {
    ATMO_FRAGMENT,
    ATMO_VERTEX,
    CLOUD_INJECTION,
    createFinalPassShader,
    createGlowUniforms,
    GLOW_FRAGMENT,
    GLOW_VERTEX,
    injectAtDithering,
    type AtmoUniforms,
    type CloudUniforms,
    MARKER_FRAGMENT,
    MARKER_VERTEX,
    type MarkerUniforms,
    type Slot,
    PLANET_INJECTION,
    type StarUniforms,
    STAR_FRAGMENT,
    STAR_VERTEX,
} from "./shaders";

declare module "three" {
    /**
     * `Material.extensions` exists at runtime in r143 (read by `WebGLPrograms` as
     * `material.extensions && material.extensions.derivatives`) but is missing from
     * `@types/three@0.143`, which also never assigns it in the `Material` constructor —
     * so it must be set before the first compile for WebGL1 to emit the
     * `GL_OES_standard_derivatives` directive that `dFdx`/`dFdy` require.
     */
    interface Material {
        extensions: {
            derivatives?: boolean;
            fragDepth?: boolean;
            drawBuffers?: boolean;
            shaderTextureLOD?: boolean;
        };
    }
}

export interface PlanetSceneHandle {
    /**
     * Fires once the planet GLTF has loaded AND the one-time float-up entrance has
     * started. Also fires when WebGL is unavailable, so callers never wait forever.
     */
    onReady?: () => void;
    /**
     * Frees every GPU resource: geometries, materials, textures, render targets,
     * the DRACO worker pool, and cancels the rAF loop. Safe to call twice.
     */
    dispose: () => void;
}

interface CloudShell {
    mesh: Mesh;
    spin: number;
}

type DrawableSource = HTMLImageElement | HTMLCanvasElement;

function prefersReducedMotion(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Availability probe only. Deliberately run against a throwaway canvas so the real
 * canvas never has a context created before `WebGL1Renderer` can apply `antialias`.
 */
function hasWebGL(): boolean {
    try {
        const probe = document.createElement("canvas");
        return Boolean(probe.getContext("webgl") ?? probe.getContext("experimental-webgl"));
    } catch {
        return false;
    }
}

function firstMesh(root: Group): Mesh | null {
    let found: Mesh | null = null;
    root.traverse((object) => {
        if (found === null && object instanceof Mesh) found = object;
    });
    return found;
}

function firstStandardMaterial(mesh: Mesh): MeshStandardMaterial | null {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    return material instanceof MeshStandardMaterial ? material : null;
}

function disposeMaterial(material: Material): void {
    for (const value of Object.values(material)) {
        if (value instanceof Texture) value.dispose();
    }
    material.dispose();
}

function disposeObject(root: Object3D): void {
    root.traverse((object) => {
        if (object instanceof Mesh || object instanceof Points) {
            object.geometry.dispose();
            const material = object.material;
            if (Array.isArray(material)) material.forEach(disposeMaterial);
            else disposeMaterial(material);
        }
    });
}

/**
 * `EffectComposer` gained `dispose()` in a later three.js revision — r143 has no such
 * method (the one in that module belongs to `FullScreenQuad`), so the render targets
 * and bloom materials have to be released explicitly.
 */
function disposeComposer(composer: EffectComposer): void {
    composer.renderTarget1.dispose();
    composer.renderTarget2.dispose();
    for (const pass of composer.passes) {
        if (pass instanceof UnrealBloomPass) pass.dispose();
    }
}

function isDrawableSource(value: unknown): value is DrawableSource {
    return (
        (typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== "undefined" && value instanceof HTMLCanvasElement)
    );
}

/**
 * Reads the planet's base-colour texture back into a canvas so ocean pixels can be
 * rejected. Returns `null` when the image is missing, undecoded or canvas-tainted —
 * markers are a garnish, so failure must never break the scene.
 */
async function readDiffusePixels(map: Texture | null): Promise<{
    data: Uint8ClampedArray;
    width: number;
    height: number;
} | null> {
    const image = map?.image;
    if (!isDrawableSource(image)) return null;
    if (image instanceof HTMLImageElement) {
        try {
            await image.decode();
        } catch {
            return null;
        }
        if (!image.complete || image.naturalWidth === 0) return null;
    }

    const width = image.width;
    const height = image.height;
    if (width === 0 || height === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null) return null;

    try {
        context.drawImage(image, 0, 0);
        return { data: context.getImageData(0, 0, width, height).data, width, height };
    } catch {
        return null;
    }
}

/**
 * Area-weighted barycentric sampling over the planet's triangles, keeping only points
 * whose UV lands on non-ocean pixels of the earth diffuse map. GLTFLoader sets
 * `texture.flipY = false`, so UV (0,0) is the image's top-left and no flip is needed.
 */
function buildLandMarkers(
    mesh: Mesh,
    pixels: { data: Uint8ClampedArray; width: number; height: number },
    markerCount: number,
): { positions: Float32Array; seeds: Float32Array } | null {
    const { geometry } = mesh;
    const position = geometry.getAttribute("position");
    const uv = geometry.getAttribute("uv");
    const index = geometry.index;
    if (position === undefined || uv === undefined) return null;

    const vertexCount = index !== null ? index.count : position.count;
    const triangleCount = Math.floor(vertexCount / 3);
    if (triangleCount === 0) return null;

    const vertexAt = (slot: number): number => (index !== null ? index.getX(slot) : slot);
    const cumulative = new Float64Array(triangleCount);
    let total = 0;
    for (let t = 0; t < triangleCount; t += 1) {
        const a = vertexAt(t * 3);
        const b = vertexAt(t * 3 + 1);
        const c = vertexAt(t * 3 + 2);
        const ax = position.getX(a);
        const ay = position.getY(a);
        const az = position.getZ(a);
        const bx = position.getX(b) - ax;
        const by = position.getY(b) - ay;
        const bz = position.getZ(b) - az;
        const cx = position.getX(c) - ax;
        const cy = position.getY(c) - ay;
        const cz = position.getZ(c) - az;
        const nx = by * cz - bz * cy;
        const ny = bz * cx - bx * cz;
        const nz = bx * cy - by * cx;
        total += 0.5 * Math.sqrt(nx * nx + ny * ny + nz * nz);
        cumulative[t] = total;
    }
    if (total <= 0) return null;

    const pickTriangle = (target: number): number => {
        let low = 0;
        let high = triangleCount - 1;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (cumulative[mid] < target) low = mid + 1;
            else high = mid;
        }
        return low;
    };

    const positions = new Float32Array(markerCount * 3);
    const seeds = new Float32Array(markerCount);
    const attempts = markerCount * 40;
    let placed = 0;
    for (let attempt = 0; attempt < attempts && placed < markerCount; attempt += 1) {
        const t = pickTriangle(Math.random() * total);
        const ia = vertexAt(t * 3);
        const ib = vertexAt(t * 3 + 1);
        const ic = vertexAt(t * 3 + 2);

        const root = Math.sqrt(Math.random());
        const wa = 1 - root;
        const wb = root * (1 - Math.random());
        const wc = root - wb;

        const u = uv.getX(ia) * wa + uv.getX(ib) * wb + uv.getX(ic) * wc;
        const v = uv.getY(ia) * wa + uv.getY(ib) * wb + uv.getY(ic) * wc;

        const px = clamp(Math.floor(u * pixels.width), 0, pixels.width - 1);
        const py = clamp(Math.floor(v * pixels.height), 0, pixels.height - 1);
        const offset = (py * pixels.width + px) * 4;
        const cr = pixels.data[offset];
        const cg = pixels.data[offset + 1];
        const cb = pixels.data[offset + 2];
        if (cb > cr + 6 && cb > cg + 6) continue;

        positions[placed * 3] = (position.getX(ia) * wa + position.getX(ib) * wb + position.getX(ic) * wc) * MARKER_LIFT;
        positions[placed * 3 + 1] =
            (position.getY(ia) * wa + position.getY(ib) * wb + position.getY(ic) * wc) * MARKER_LIFT;
        positions[placed * 3 + 2] =
            (position.getZ(ia) * wa + position.getZ(ib) * wb + position.getZ(ic) * wc) * MARKER_LIFT;
        seeds[placed] = Math.random();
        placed += 1;
    }

    if (placed === 0) return null;
    return { positions: positions.subarray(0, placed * 3), seeds: seeds.subarray(0, placed) };
}

// ponytail: the source clouds PNG is 6000x6000 and decoding/uploading that costs seconds of
// main-thread time on a throttled phone; createImageBitmap resizes off-thread instead. Ceiling
// = 2048 cap (still denser than the ~500px globe). Upgrade path: ship a 2048 asset.
async function loadScaledTexture(url: string, maxSize: number): Promise<Texture> {
    const bitmap = await createImageBitmap(await (await fetch(url)).blob());
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("planet: 2d context unavailable");
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createPlanetScene(options: {
    canvas: HTMLCanvasElement;
    onReady?: () => void;
}): PlanetSceneHandle {
    const { canvas, onReady } = options;

    // The only place the mobile tier is decided. Every knob below reads this one flag,
    // so desktop keeps its exact previous behaviour through the false branches.
    const mobile = isMobileViewport();
    const count = (n: number): number => scaleCount(n, mobile);
    const resolvePixelRatio = (): number =>
        mobile ? Math.min(window.devicePixelRatio, MOBILE_MAX_PIXEL_RATIO) : window.devicePixelRatio;

    if (!hasWebGL()) {
        onReady?.();
        return { onReady, dispose: () => {} };
    }

    let renderer: WebGLRenderer;
    try {
        renderer = new WebGL1Renderer({ canvas, antialias: true });
    } catch (error) {
        console.warn("[planet] WebGL renderer unavailable; rendering nothing.", error);
        onReady?.();
        return { onReady, dispose: () => {} };
    }

    renderer.setPixelRatio(resolvePixelRatio());
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;

    const reducedMotion = prefersReducedMotion();

    const scene = new Scene();
    scene.background = new Color(0x000000);

    const camera = new PerspectiveCamera(40, 1, 0.1, 200);
    camera.position.set(0, 0, 8);
    camera.layers.enable(LAYERS.TORUS_SCENE);
    camera.layers.enable(LAYERS.BLOOM_SCENE);
    camera.layers.enable(LAYERS.ENTIRE_SCENE);
    scene.add(camera);

    const ambient = new AmbientLight(0xffffff, 1.8);
    ambient.layers.set(LAYERS.ENTIRE_SCENE);
    scene.add(ambient);

    const keyLight = new DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(0, 10, 2);
    keyLight.layers.set(LAYERS.ENTIRE_SCENE);
    scene.add(keyLight);

    /* ------------------------------------------------------------------ composers */

    const torusComposer = new EffectComposer(renderer);
    torusComposer.renderToScreen = false;
    torusComposer.addPass(new RenderPass(scene, camera));
    torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
    torusComposer.addPass(new UnrealBloomPass(new Vector2(1, 1), 0.22, 0.2, 0));
    torusComposer.addPass(new ShaderPass(CopyShader));

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(new RenderPass(scene, camera));
    bloomComposer.addPass(new UnrealBloomPass(new Vector2(1, 1), 0.5, 0.6, 0));
    bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(new RenderPass(scene, camera));
    const finalPass = new ShaderPass(createFinalPassShader());
    finalComposer.addPass(finalPass);

    const blackTexture = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, RGBAFormat);
    blackTexture.needsUpdate = true;

    // `ShaderPass` deep-copies the shader's uniforms, so the pass owns the live handles.
    const finalUniforms = finalPass.uniforms;
    // ponytail: mobile drops the whole torus chain. Nothing is ever assigned layer 1
    // (TORUS_SCENE), so its RenderPass draws an empty scene and the gamma + UnrealBloom
    // mip chain + copy after it resolve black -- ~13 full-screen passes, ~9.9 Mpix/frame
    // at the 0.76 Mpix mobile buffer, for exactly zero image contribution. FinalPass sums
    // the target in, and an empty chain contributes 1x1 black. Ceiling: mobile gives up
    // that bloom. Upgrade path: put real objects on TORUS_SCENE, then re-enable mobile
    // and buy the budget back with DPR instead.
    finalUniforms.torusTexture.value = mobile ? blackTexture : torusComposer.renderTarget1.texture;
    // Mobile never renders bloomComposer, so its target would stay uninitialised.
    // The 1x1 black texture is exactly what an empty bloom pass contributes.
    finalUniforms.bloomTexture.value = mobile ? blackTexture : bloomComposer.renderTarget1.texture;
    finalUniforms.haloTexture.value = blackTexture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enabled = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = CONFIG.autoRotate;
    controls.minDistance = 3.5;
    controls.maxDistance = 16;
    controls.target.set(0, 0, 0);

    /* --------------------------------------------------------------- scene graph */

    const worldGroup = new Group();
    const planetGroup = new Group();
    planetGroup.rotation.z = CONFIG.tilt;
    const cloudGroup = new Group();
    cloudGroup.rotation.z = CONFIG.tilt;
    cloudGroup.visible = false;
    worldGroup.add(planetGroup, cloudGroup);
    worldGroup.position.set(STOPS_X[0].v, STOPS_Y[0].v, 0);
    worldGroup.scale.setScalar(STOPS_S[0].v);
    worldGroup.layers.set(LAYERS.ENTIRE_SCENE);
    scene.add(worldGroup);

    const glowUniforms = createGlowUniforms();
    const glowMesh = new Mesh(
        new PlaneGeometry(2, 2),
        new ShaderMaterial({
            uniforms: glowUniforms,
            vertexShader: GLOW_VERTEX,
            fragmentShader: GLOW_FRAGMENT,
            transparent: true,
            side: DoubleSide,
            depthWrite: false,
            blending: AdditiveBlending,
        }),
    );
    glowMesh.scale.setScalar(CONFIG.planetRadius * 2.3);
    glowMesh.layers.set(LAYERS.ENTIRE_SCENE);
        worldGroup.add(glowMesh);

    const planetTime: Slot<number> = { value: 0 };
    const planetFade: Slot<number> = { value: 1 };
    const cloudTime: Slot<number> = { value: 0 };
    const starTime: Slot<number> = { value: 0 };
    const markerTime: Slot<number> = { value: 0 };

    /* --------------------------------------------------------------- point clouds */

    const resUniforms: Slot<Vector2>[] = [];

    // The globe is a hero-scale moment. Below the hero it would sit behind four
    // text-heavy sections and wreck legibility, so it fades out over
    // SCROLL_FADE_START..SCROLL_FADE_END and the copy is left on clean space.
    const planetFadeMaterials: Material[] = [];
    const planetFadeObjects: Object3D[] = [];

    const atmoUniforms: AtmoUniforms = {
        uTime: { value: 0 },
        uRes: { value: new Vector2(1, 1) },
        uColor: { value: hexToVec3(CONFIG.atmoColor) },
    };
    resUniforms.push(atmoUniforms.uRes);

    const moteCount = count(CONFIG.atmoCount);
    const motePositions = new Float32Array(moteCount * 3);
    const moteSizes = new Float32Array(moteCount);
    const moteSeeds = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i += 1) {
        motePositions[i * 3] = Math.random() * 2 - 1;
        motePositions[i * 3 + 1] = Math.random() * 2 - 1;
        motePositions[i * 3 + 2] = Math.random() * 2 - 1;
        moteSizes[i] = CONFIG.atmoSize * (0.4 + Math.random());
        moteSeeds[i] = Math.random();
    }
    const moteGeometry = new BufferGeometry();
    moteGeometry.setAttribute("position", new BufferAttribute(motePositions, 3));
    moteGeometry.setAttribute("size", new BufferAttribute(moteSizes, 1));
    moteGeometry.setAttribute("seed", new BufferAttribute(moteSeeds, 1));
    const motes = new Points(
        moteGeometry,
        new ShaderMaterial({
            uniforms: atmoUniforms,
            vertexShader: ATMO_VERTEX,
            fragmentShader: ATMO_FRAGMENT,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: AdditiveBlending,
        }),
    );
    // The vertex shader displaces `position * 4.0`, so the CPU-side bounding sphere
    // cannot be trusted for culling.
    motes.frustumCulled = false;
    motes.layers.set(LAYERS.ENTIRE_SCENE);
    scene.add(motes);
    motes.onBeforeRender = () => {
        const seconds = performance.now() * CONFIG.atmoSpeed * 8;
        atmoUniforms.uTime.value = seconds;
        finalUniforms.iTime.value = seconds;
    };

    const starUniforms: StarUniforms = {
        uTime: starTime,
        uRes: { value: new Vector2(1, 1) },
        uColor: { value: hexToVec3(CONFIG.starColor) },
        uSize: { value: CONFIG.starSize },
        uFlicker: { value: CONFIG.starFlicker },
    };
    resUniforms.push(starUniforms.uRes);

    const starCount = count(CONFIG.starCount);
    const starPositions = new Float32Array(starCount * 3);
    const starSeeds = new Float32Array(starCount);
    const starBrights = new Float32Array(starCount);
    for (let i = 0; i < starCount; i += 1) {
        const theta = Math.random() * Math.PI * 2;
        const cosPhi = Math.random() * 2 - 1;
        const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
        starPositions[i * 3] = STAR_SPHERE_RADIUS * sinPhi * Math.cos(theta);
        starPositions[i * 3 + 1] = STAR_SPHERE_RADIUS * cosPhi;
        starPositions[i * 3 + 2] = STAR_SPHERE_RADIUS * sinPhi * Math.sin(theta);
        starSeeds[i] = Math.random() * Math.PI * 2; // full 2π: STAR_VERTEX uses seed as a sin() phase, not a 0-1 fraction
        starBrights[i] = 0.35 + Math.random() * 0.65;
    }
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("seed", new BufferAttribute(starSeeds, 1));
    starGeometry.setAttribute("bright", new BufferAttribute(starBrights, 1));
    const stars = new Points(
        starGeometry,
        new ShaderMaterial({
            uniforms: starUniforms,
            vertexShader: STAR_VERTEX,
            fragmentShader: STAR_FRAGMENT,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: AdditiveBlending,
        }),
    );
    stars.frustumCulled = false;
    stars.layers.set(LAYERS.ENTIRE_SCENE);
    scene.add(stars);

    /* ----------------------------------------------------------------- cloud shells */

    const clouds: CloudShell[] = [];

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const extraTextures: Texture[] = [blackTexture];

    let disposed = false;
    let rafId = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let scrollTop = 0;
    let scrollRange = 1;

    const measureScroll = (): void => {
        scrollTop = window.scrollY;
        scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const applySize = (): void => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || window.innerWidth));
        const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || window.innerHeight));
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;

        const pixelRatio = resolvePixelRatio();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height);
        for (const composer of [torusComposer, bloomComposer, finalComposer]) {
            composer.setPixelRatio(pixelRatio);
            composer.setSize(width, height);
        }
        for (const uniform of resUniforms) uniform.value.set(width * pixelRatio, height * pixelRatio);
        measureScroll();
    };

    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", applySize);
    window.addEventListener("scroll", measureScroll, { passive: true });
    measureScroll();
    applySize();

    /* ------------------------------------------------------------------- frame loop */

    let previousNow = performance.now();
    let spinPhase = 0;
    let curP = 0;
    let curX = STOPS_X[0].v;
    let curY = STOPS_Y[0].v;
    let curS = STOPS_S[0].v;
    let entryElapsed = reducedMotion ? ENTRY_DUR : 0;
    let fade = 1;

    const frame = (): void => {
        rafId = requestAnimationFrame(frame);

        const now = performance.now();
        const dt = Math.min((now - previousNow) / 1000, 0.05);
        previousNow = now;

        planetTime.value += dt / 12;
        cloudTime.value += dt / 20;
        starTime.value += dt;
        markerTime.value += dt;
        if (!reducedMotion) {
            spinPhase += dt * CONFIG.spin;
            entryElapsed = Math.min(ENTRY_DUR, entryElapsed + dt);
        }
        const entryT = clamp(entryElapsed / ENTRY_DUR, 0, 1);
        // Rising entrance: -6.5 at t=0 -> 0 at t=1. The multiplier must be
        // (1-t)^3, not 1-(1-t)^3 — the latter runs the planet *down* to -6.5
        // and parks it below the viewport.
        const entryY = ENTRY_START_Y * Math.pow(1 - entryT, 3);

        const pTarget = clamp(scrollTop / scrollRange, 0, 1);
        curP += (pTarget - curP) * Math.min(1, dt * 4.5);
        const sideScale = clamp(window.innerWidth / 1200, 0.5, 1);
        const damp = Math.min(1, dt * 3.2);
        curX += (sample(STOPS_X, curP) * sideScale - curX) * damp;
        curY += (sample(STOPS_Y, curP) - curY) * damp;
        curS += (sample(STOPS_S, curP) - curS) * damp;

        worldGroup.position.set(curX, curY + entryY, 0);
        worldGroup.scale.setScalar(curS);
        {
            const t = clamp(
                (curP - SCROLL_FADE_START) / (SCROLL_FADE_END - SCROLL_FADE_START),
                0,
                1,
            );
            fade = 1 - t * t * (3 - 2 * t);
            planetFade.value = fade;
            for (const material of planetFadeMaterials) material.opacity = fade;
            for (const object of planetFadeObjects) object.visible = fade > 0.01;
            glowUniforms.uIntensity.value = CONFIG.glowIntensity * fade;
        }
        planetGroup.rotation.y = CONFIG.initRotation + spinPhase + curP * Math.PI * 1.6;

        for (const cloud of clouds) cloud.mesh.rotation.y += dt * cloud.spin;

        controls.update();
        glowMesh.quaternion.copy(camera.quaternion);
        motes.position.copy(camera.position);

        // ponytail: mobile intentionally renders only the final composer; both chains
        // resolve to black there and FinalPass adds black in. Ceiling: mobile gives up the
        // marker halo. Upgrade path: assign real objects to TORUS_SCENE, then re-enable
        // mobile and reclaim the budget via DPR.
        if (!mobile) {
            camera.layers.set(LAYERS.TORUS_SCENE);
            torusComposer.render();
            // ponytail: mobile skips the whole bloom composer — one scene render plus an
            // UnrealBloomPass mip chain, every frame. Ceiling: land markers lose this pass's
            // additive halo (they still draw in finalComposer). Upgrade path: run the bloom
            // target at half resolution instead of dropping it.
            camera.layers.set(LAYERS.BLOOM_SCENE);
            bloomComposer.render();
        }
        camera.layers.set(LAYERS.ENTIRE_SCENE);
        // ponytail: once the globe has fully faded (scroll past SCROLL_FADE_END) every
        // planet object is already `visible=false`, so drawing the composer again paints
        // nothing but still costs a full-screen pass. Ceiling: the loop still runs (cheap
        // state updates) so scroll-back reappears correctly. Upgrade path: halt the rAF
        // entirely and resume from the scroll listener.
        if (fade > 0.01) finalComposer.render();
    };
    rafId = requestAnimationFrame(frame);

    /* ---------------------------------------------------------------- asset loading */

    const load = async (): Promise<void> => {
        const lightsGltf = await gltfLoader.loadAsync(PLANET_LIGHTS_GLB);
        if (disposed) return;
        const lightsMesh = firstMesh(lightsGltf.scene);
        const nightTex = (lightsMesh !== null ? firstStandardMaterial(lightsMesh)?.map : null) ?? null;
        if (nightTex !== null) extraTextures.push(nightTex);
        // Only the texture is used from this file; free the rest immediately.
        disposeObject(lightsGltf.scene);

        const planetGltf = await gltfLoader.loadAsync(PLANET_GLB);
        if (disposed) return;
        const planetSource = firstMesh(planetGltf.scene);
        if (planetSource === null) throw new Error("planet.glb contains no mesh");
        const sourceMaterial = firstStandardMaterial(planetSource);
        if (sourceMaterial === null) throw new Error("planet.glb material is not a MeshStandardMaterial");

        const planetGeometry = planetSource.geometry;
        planetGeometry.computeBoundingSphere();
        planetSource.scale.setScalar(CONFIG.planetRadius / (planetGeometry.boundingSphere?.radius ?? 1));

        const planetMaterial = sourceMaterial.clone();
        sourceMaterial.dispose();
        planetMaterial.metalness = 0;
        planetMaterial.roughness = 1;
        planetMaterial.envMapIntensity = 0;
        // WebGL1 needs this for `dFdx`/`dFdy` in the injected terrain-bump maths.
        planetMaterial.extensions = { derivatives: true };
        planetMaterial.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, {
                time: planetTime,
                noiseScale: { value: 30 },
                speedX: { value: 1.5 },
                speedY: { value: 2.0 },
                speedZ: { value: 2.5 },
                rimColor: { value: hexToVec3(CONFIG.rimColor) },
                rimPower: { value: CONFIG.rimPower },
                nightBlendTexture: { value: nightTex },
                nightLights: { value: CONFIG.nightLights },
                terrainDepth: { value: CONFIG.terrainDepth },
                terrainShade: { value: CONFIG.terrainShade },
                oceanGlint: { value: CONFIG.oceanGlint },
                oceanDeep: { value: CONFIG.oceanDeep },
                oceanFlow: { value: CONFIG.oceanFlow },
                oceanFlowSpeed: { value: CONFIG.oceanFlowSpeed },
                oceanFlowScale: { value: CONFIG.oceanFlowScale },
                fade: planetFade,
            });
            injectAtDithering(shader, PLANET_INJECTION);
        };
        planetSource.material = planetMaterial;
        // `Object3D.layers` is NOT inherited: `projectObject` tests every child
        // against its own mask, and the render loop does `camera.layers.set(3)`.
        // Without this the planet stays on layer 0 and is silently never drawn.
        planetSource.layers.set(LAYERS.ENTIRE_SCENE);
        planetGroup.add(planetSource);

        const cloudTexture = await loadScaledTexture(PLANET_CLOUDS_PNG, 2048);
        if (disposed) return;
        cloudTexture.wrapS = RepeatWrapping;
        cloudTexture.wrapT = RepeatWrapping;
        cloudTexture.repeat.set(5, 5);
        extraTextures.push(cloudTexture);

        const layers = [
            { h: CONFIG.cloud1Height, o: CONFIG.cloud1Opacity, s: CONFIG.cloud1Spin, ry: 0.0, phase: 0.0 },
            { h: CONFIG.cloud2Height, o: CONFIG.cloud2Opacity, s: CONFIG.cloud2Spin, ry: 2.2, phase: 13.0 },
            { h: CONFIG.cloud3Height, o: CONFIG.cloud3Opacity, s: CONFIG.cloud3Spin, ry: 4.3, phase: 27.0 },
        ];
        for (const layer of layers) {
            const uniforms: CloudUniforms = {
                uTime: cloudTime,
                noiseScale: { value: 20 },
                uSpeedX: { value: 1 },
                uSpeedY: { value: 2 },
                uSpeedZ: { value: 2 },
                uOpacity: { value: layer.o },
                uPhase: { value: layer.phase },
            };
            const material = new MeshStandardMaterial({
                map: cloudTexture,
                transparent: true,
                depthWrite: false,
            });
            material.extensions = { derivatives: true };
            material.onBeforeCompile = (shader) => {
                Object.assign(shader.uniforms, uniforms);
                injectAtDithering(shader, CLOUD_INJECTION);
            };
            const mesh = new Mesh(
                new SphereGeometry(
                    CONFIG.planetRadius * layer.h,
                    cloudSegments(CLOUD_GEOMETRY_SEGMENTS, mobile),
                    cloudSegments(CLOUD_GEOMETRY_SEGMENTS, mobile),
                ),
                material,
            );
            mesh.rotation.y = layer.ry;
            mesh.renderOrder = 2;
            mesh.layers.set(LAYERS.ENTIRE_SCENE);
            cloudGroup.add(mesh);
            planetFadeMaterials.push(material);
            clouds.push({ mesh, spin: layer.s });
        }
        cloudGroup.visible = true;

        const pixels = await readDiffusePixels(planetMaterial.map);
        if (pixels === null) {
            console.warn("[planet] Could not read the diffuse texture; skipping land markers.");
        } else {
            if (disposed) return;
            const sampled = buildLandMarkers(planetSource, pixels, count(CONFIG.markerCount));
            if (sampled === null) {
                console.warn("[planet] No land sample points found; skipping land markers.");
            } else {
                const markerUniforms: MarkerUniforms = {
                    uTime: markerTime,
                    uRes: { value: new Vector2(1, 1) },
                    uColor: { value: hexToVec3(CONFIG.markerColor) },
                    uSize: { value: CONFIG.markerSize },
                    uSpeed: { value: CONFIG.markerSpeed },
                };
                resUniforms.push(markerUniforms.uRes);
                // Same cap as applySize: an uncapped value here would size the marker
                // points against a resolution the renderer is no longer using.
                const pixelRatio = resolvePixelRatio();
                markerUniforms.uRes.value.set(lastWidth * pixelRatio, lastHeight * pixelRatio);

                const markerGeometry = new BufferGeometry();
                markerGeometry.setAttribute("position", new BufferAttribute(sampled.positions, 3));
                markerGeometry.setAttribute("seed", new BufferAttribute(sampled.seeds, 1));
                const markerPoints = new Points(
                    markerGeometry,
                    new ShaderMaterial({
                        uniforms: markerUniforms,
                        vertexShader: MARKER_VERTEX,
                        fragmentShader: MARKER_FRAGMENT,
                        transparent: true,
                        depthTest: true,
                        depthWrite: false,
                        blending: AdditiveBlending,
                    }),
                );
                markerPoints.frustumCulled = false;
                markerPoints.layers.set(LAYERS.ENTIRE_SCENE);
                markerPoints.layers.enable(LAYERS.BLOOM_SCENE);
                planetSource.add(markerPoints);
                planetFadeObjects.push(markerPoints);
            }
        }
    };

    load()
        .then(() => {
            if (disposed) return;
            onReady?.();
        })
        .catch((error: unknown) => {
            console.warn("[planet] Asset load failed; the planet will not appear.", error);
            if (!disposed) onReady?.();
        });

    const dispose = (): void => {
        if (disposed) return;
        disposed = true;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;

        resizeObserver.disconnect();
        window.removeEventListener("resize", applySize);
        window.removeEventListener("scroll", measureScroll);
        controls.dispose();

        disposeObject(scene);
        for (const texture of extraTextures) texture.dispose();
        for (const composer of [torusComposer, bloomComposer, finalComposer]) disposeComposer(composer);
        dracoLoader.dispose();
        renderer.dispose();
    };

    return { onReady, dispose };
}
