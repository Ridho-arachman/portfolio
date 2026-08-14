import { Delaunay } from "d3-delaunay";
import polygonClipping from "polygon-clipping";
import type { VisitorCountry } from "@/components/sections/admin-dashboard/constants";

export const PROJECTION = { kx: 2.8128, bx: 474.1, ky: -3.4261, by: 465.02 };

const WORLD_BOUNDS: [number, number, number, number] = [0, 0, 1010, 666];

export interface Point {
  x: number;
  y: number;
}

export type Ring = Point[];

export function project(lat: number, lng: number): Point {
  return {
    x: PROJECTION.kx * lng + PROJECTION.bx,
    y: PROJECTION.ky * lat + PROJECTION.by,
  };
}

export function parsePathD(d: string): Ring[] {
  const rings: Ring[] = [];
  const tokens = d.match(/m|-?[\d.]+(?:e-?\d+)?|z/gi) ?? [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let current: Point[] = [];

  const flush = () => {
    if (current.length > 0) rings.push(current);
    current = [];
  };

  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i];
    if (token === "m") {
      flush();
      x += Number(tokens[i + 1]);
      y += Number(tokens[i + 2]);
      i += 3;
      startX = x;
      startY = y;
      current.push({ x, y });
    } else if (token === "z") {
      flush();
      x = startX;
      y = startY;
      i += 1;
    } else {
      x += Number(token);
      y += Number(tokens[i + 1]);
      i += 2;
      current.push({ x, y });
    }
  }
  flush();
  return rings;
}

export interface Cell {
  cityName: string;
  visits: number;
  rings: Ring[];
}

function toPair(ring: Ring): [number, number][] {
  return ring.map((p) => [p.x, p.y]);
}

export function ringsToPath(rings: Ring[]): string {
  return rings
    .map((ring) => {
      if (ring.length === 0) return "";
      const parts = ring.map((p) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`);
      return `M ${parts.join(" L ")} Z`;
    })
    .join(" ");
}

export function countryCells(country: VisitorCountry, rings: Ring[]): Cell[] {
  if (country.cities.length === 0 || rings.length === 0) return [];

  const points = country.cities.map((city) => {
    const p = project(city.lat, city.lng);
    return [p.x, p.y] as [number, number];
  });

  if (points.length === 1) {
    return [
      {
        cityName: country.cities[0].name,
        visits: country.cities[0].visits,
        rings,
      },
    ];
  }

  const countryGeom = rings.map(toPair);
  const voronoi = Delaunay.from(points).voronoi(WORLD_BOUNDS);
  const cells: Cell[] = [];

  country.cities.forEach((city, index) => {
    const polygon = voronoi.cellPolygon(index);
    if (!polygon) return;
    try {
      const clipped = polygonClipping.intersection(
        [polygon.map(([x, y]) => [x, y] as [number, number])],
        countryGeom,
      );
      if (!clipped || clipped.length === 0) return;
      const cellRings: Ring[] = clipped.map((poly) =>
        poly.map((p) => ({ x: Number(p[0]), y: Number(p[1]) })),
      );
      cells.push({ cityName: city.name, visits: city.visits, rings: cellRings });
    } catch {
      return;
    }
  });

  return cells;
}
