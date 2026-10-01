"use client";

import { useEffect, useRef } from "react";
import { createPlanetScene, type PlanetSceneHandle } from "@/lib/planet";

export function PlanetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: PlanetSceneHandle | undefined;
    try {
      handle = createPlanetScene({ canvas });
    } catch {
      return;
    }

    return () => handle?.dispose();
  }, []);

  return <canvas ref={canvasRef} className="planet-canvas" aria-hidden="true" />;
}