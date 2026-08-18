"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  countryFeaturesByCode,
  worldCountries,
  worldCountryFeatures,
} from "@/lib/geo";
import type { VisitorCountry } from "./constants";
import "./visitor-map-leaflet.css";

const MIN_BADGE_ZOOM = 4;
const FIT_PADDING: L.FitBoundsOptions = { padding: [28, 28], maxZoom: 9 };
const WORLD_BOUNDS = L.latLngBounds([
  [-85, -180],
  [85, 180],
]);

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface VisitorMapLeafletProps {
  countries: VisitorCountry[];
  byCode: Map<string, VisitorCountry>;
  activeRegion: string;
  selectedCode: string | null;
  onSelectCountry: (code: string) => void;
  totalVisits: number;
}

function pct(visits: number, total: number) {
  return total > 0 ? (visits / total) * 100 : 0;
}

function resolveVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function cityBadgeIcon(visits: number) {
  const label =
    visits >= 1000
      ? `${(visits / 1000).toFixed(visits >= 10000 ? 0 : 1)}K`
      : String(visits);
  return L.divIcon({
    className: "visitor-badge",
    html: `<span>${label}</span>`,
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}

function DynamicMinZoom() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const apply = () => {
      const width = container.clientWidth;
      if (width <= 0) return;
      const fillZoom = Math.max(1, Math.ceil(Math.log2(width / 256)));
      map.setMinZoom(fillZoom);
      if (map.getZoom() < fillZoom) map.setZoom(fillZoom);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, FIT_PADDING);
  }, [map, bounds]);
  return null;
}

function ZoomedChildren({
  minZoom,
  children,
}: {
  minZoom: number;
  children: React.ReactNode;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useEffect(() => {
    const onChange = () => setZoom(map.getZoom());
    map.on("zoomend", onChange);
    return () => {
      map.off("zoomend", onChange);
    };
  }, [map]);
  return zoom >= minZoom ? <>{children}</> : null;
}

function MapControls({ initialBounds }: { initialBounds: L.LatLngBounds }) {
  const map = useMap();
  return (
    <div className="absolute right-3 top-3 z-[600] flex flex-col gap-1.5 rounded-xl border border-glass-border bg-glass-bg/90 p-1.5 shadow-lg backdrop-blur-xl">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map.fitBounds(initialBounds, FIT_PADDING)}
        aria-label="Reset zoom"
        className="flex h-8 w-8 items-center justify-center rounded-lg border-t border-glass-border text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

export function VisitorMapLeaflet({
  countries,
  byCode,
  activeRegion,
  selectedCode,
  onSelectCountry,
  totalVisits,
}: VisitorMapLeafletProps) {
  const accent = resolveVar("--color-accent", "#a78bfa");

  const visibleCountries = useMemo(() => {
    if (selectedCode) {
      const selected = byCode.get(selectedCode);
      return selected ? [selected] : [];
    }
    return activeRegion === "All"
      ? countries
      : countries.filter((country) => country.region === activeRegion);
  }, [countries, byCode, selectedCode, activeRegion]);

  const allCityBounds = useMemo(() => {
    const points = countries.flatMap((country) =>
      country.cities.map(
        (city) => [city.lat, city.lng] as [number, number],
      ),
    );
    return L.latLngBounds(points);
  }, [countries]);

  const fitBounds = useMemo<L.LatLngBounds | null>(() => {
    if (selectedCode) {
      const feature = countryFeaturesByCode.get(selectedCode);
      if (feature) {
        return (L.geoJSON(feature as never) as L.GeoJSON).getBounds();
      }
      return null;
    }
    const points = visibleCountries.flatMap((country) =>
      country.cities.map(
        (city) => [city.lat, city.lng] as [number, number],
      ),
    );
    return points.length > 0 ? L.latLngBounds(points) : null;
  }, [visibleCountries, selectedCode]);

  const codeByFeatureId = useMemo(() => {
    const map = new Map<string, string>();
    for (const world of worldCountries) {
      if (world.code) map.set(world.id, world.code);
    }
    return map;
  }, []);

  const countryLayerData = useMemo(
    () =>
      ({
        type: "FeatureCollection",
        features: worldCountryFeatures,
      }) as unknown as GeoJsonObject,
    [],
  );

  const countryStyle = (feature?: unknown) => {
    const code = codeByFeatureId.get(
      String((feature as { id?: string | number } | undefined)?.id ?? ""),
    );
    const country = code ? (byCode.get(code) ?? null) : null;
    if (!country) {
      return { color: "rgba(255,255,255,0.08)", weight: 0.4, fillOpacity: 0 };
    }
    const isSelected = code === selectedCode;
    const dimmed =
      activeRegion !== "All" &&
      country.region !== activeRegion;
    const share = country.visits / totalVisits;
    const opacity = dimmed ? 0.03 : 0.1 + 0.3 * Math.min(share * 22, 1);
    return {
      color: accent,
      weight: isSelected ? 1.5 : 0.5,
      fillColor: accent,
      fillOpacity: isSelected ? 0.45 : opacity,
    };
  };

  return (
    <div className="visitor-leaflet relative h-full w-full">
      <MapContainer
        center={[20, 5]}
        zoom={2}
        minZoom={1}
        maxZoom={18}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          subdomains="abcd"
          noWrap
        />

        <GeoJSON
          data={countryLayerData}
          style={countryStyle}
          eventHandlers={{
            click: (event) => {
              const code = codeByFeatureId.get(
                String((event.sourceTarget?.feature as { id?: string | number })
                  ?.id ?? ""),
              );
              if (code) {
                event.originalEvent.stopPropagation();
                onSelectCountry(code);
              }
            },
          }}
        />

        <ZoomedChildren minZoom={MIN_BADGE_ZOOM}>
          {visibleCountries.map((country) =>
            country.cities.map((city) => (
              <Marker
                key={`${country.code}-${city.name}`}
                position={[city.lat, city.lng]}
                icon={cityBadgeIcon(city.visits)}
                eventHandlers={{
                  click: (event) => {
                    event.originalEvent.stopPropagation();
                    onSelectCountry(country.code);
                  },
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -14]}
                  className="visitor-tooltip"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">
                      {country.flag ?? "🌐"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-text-primary">
                        {city.name}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {country.country}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-lg font-bold tabular-nums text-accent">
                    {city.visits.toLocaleString("en-US")}
                    <span className="ml-1 text-xs font-normal text-text-muted">
                      {pct(city.visits, totalVisits).toFixed(1)}%
                    </span>
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {country.region}
                  </p>
                </Tooltip>
              </Marker>
            )),
          )}
        </ZoomedChildren>

        <FitBounds bounds={fitBounds} />

        <DynamicMinZoom />

        <MapControls initialBounds={allCityBounds} />
      </MapContainer>
    </div>
  );
}
