"use client";

import world from "@svg-maps/world";
import { ChevronLeft, ChevronRight, Globe, Minus, Plus, RotateCcw } from "lucide-react";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { countryCells, parsePathD, ringsToPath, type Cell } from "@/lib/geo";
import {
  TOTAL_VISITS,
  TOTAL_VISITS_FORMATTED,
  TOTAL_VISITS_LABEL,
  VISITS_OVERVIEW_DELTA,
  VISITOR_BACK_LABEL,
  VISITOR_CITIES_LABEL,
  VISITOR_MAP_CAPTION,
  VISITOR_MAP_LABEL,
  VISITOR_NO_CITIES_LABEL,
  VISITOR_REGION_ALL,
  VISITOR_REGIONS,
  VISITOR_LOCATIONS,
  type VisitorCountry,
} from "./constants";

const NO_DATA_LABEL = "No visit data";
const TOOLTIP_WIDTH = 200;
const TOOLTIP_HEIGHT = 84;
const TOOLTIP_HEIGHT_CITY = 106;

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const MIN_CELL_SCALE = 2;

interface View {
  scale: number;
  tx: number;
  ty: number;
}

interface Hovered {
  code: string;
  x: number;
  y: number;
}

interface HoveredCity {
  name: string;
  country: string;
  region: string;
  flag: string;
  visits: number;
  x: number;
  y: number;
}

interface CountryCells {
  code: string;
  country: VisitorCountry;
  cells: Cell[];
}

function pct(visits: number, total: number) {
  return total > 0 ? (visits / total) * 100 : 0;
}

const DEFAULT_VIEW: View = { scale: 1, tx: 0, ty: 0 };

export function VisitorMap() {
  const [activeRegion, setActiveRegion] = useState(VISITOR_REGION_ALL);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [hoveredCity, setHoveredCity] = useState<HoveredCity | null>(null);
  const [view, setView] = useState<View>(DEFAULT_VIEW);

  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    tx: number;
    ty: number;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const byCode = useMemo(
    () => new Map(VISITOR_LOCATIONS.map((country) => [country.code, country])),
    [],
  );

  const cellsByCountry = useMemo<CountryCells[]>(() => {
    const worldPath = new Map(world.locations.map((location) => [location.id, location.path]));
    const result: CountryCells[] = [];
    for (const country of VISITOR_LOCATIONS) {
      if (country.cities.length === 0) continue;
      const d = worldPath.get(country.code);
      if (!d) continue;
      const cells = countryCells(country, parsePathD(d));
      if (cells.length === 0) continue;
      result.push({ code: country.code, country, cells });
    }
    return result;
  }, []);

  const ranked = useMemo(() => {
    const filtered =
      activeRegion === VISITOR_REGION_ALL
        ? VISITOR_LOCATIONS
        : VISITOR_LOCATIONS.filter(
            (country) => country.region === activeRegion,
          );
    return [...filtered].sort((a, b) => b.visits - a.visits);
  }, [activeRegion]);

  const selected = selectedCode ? (byCode.get(selectedCode) ?? null) : null;

  const selectRegion = (region: string) => {
    setActiveRegion(region);
    setSelectedCode(null);
  };

  const mapOpacity = (country: VisitorCountry | undefined) => {
    if (activeRegion !== VISITOR_REGION_ALL && country?.region !== activeRegion) {
      return 0.15;
    }
    if (!country) return 0.35;
    const share = country.visits / TOTAL_VISITS;
    return 0.35 + 0.65 * Math.min(share * 22, 1);
  };

  const zoomAt = (mx: number, my: number, factor: number) => {
    setView((prev) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
      const k = scale / prev.scale;
      return {
        scale,
        tx: mx - (mx - prev.tx) * k,
        ty: my - (my - prev.ty) * k,
      };
    });
  };

  const zoomByButton = (factor: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(rect.width / 2, rect.height / 2, factor);
  };

  const resetView = () => setView(DEFAULT_VIEW);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1.15 : 0.87);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      tx: view.tx,
      ty: view.ty,
    };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      suppressClickRef.current = true;
    }
    setView((prev) => ({ ...prev, tx: drag.tx + dx, ty: drag.ty + dy }));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const tooltipPosition = (event: MouseEvent<SVGPathElement>, height: number) => {
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.min(event.clientX - rect.left + 12, rect.width - TOOLTIP_WIDTH - 4),
      y: Math.min(event.clientY - rect.top + 12, rect.height - height - 4),
    };
  };

  const handleMove = (event: MouseEvent<SVGPathElement>, code: string) => {
    const country = byCode.get(code);
    const isSingleCity = view.scale >= MIN_CELL_SCALE && country?.cities.length === 1;
    const pos = tooltipPosition(event, isSingleCity ? TOOLTIP_HEIGHT_CITY : TOOLTIP_HEIGHT);
    if (!pos) return;
    if (isSingleCity && country) {
      const city = country.cities[0];
      setHovered(null);
      setHoveredCity({
        name: city.name,
        country: country.country,
        region: country.region,
        flag: country.flag ?? "🌐",
        visits: city.visits,
        ...pos,
      });
    } else {
      setHoveredCity(null);
      setHovered({ code, ...pos });
    }
  };

  const handleCityMove = (
    event: MouseEvent<SVGPathElement>,
    entry: CountryCells,
    cell: Cell,
  ) => {
    const pos = tooltipPosition(event, TOOLTIP_HEIGHT_CITY);
    if (!pos) return;
    setHovered(null);
    setHoveredCity({
      name: cell.cityName,
      country: entry.country.country,
      region: entry.country.region,
      flag: entry.country.flag ?? "🌐",
      visits: cell.visits,
      ...pos,
    });
  };

  const hoveredCountry = hovered ? (byCode.get(hovered.code) ?? null) : null;
  const showCells = view.scale >= MIN_CELL_SCALE;

  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <header className="flex flex-col gap-4 border-b border-glass-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">{VISITOR_MAP_LABEL}</h2>
            <p className="text-xs text-text-muted">{VISITOR_MAP_CAPTION}</p>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {TOTAL_VISITS_FORMATTED}
            </p>
            <p className="text-xs text-text-muted">{TOTAL_VISITS_LABEL}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
            {VISITS_OVERVIEW_DELTA}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-glass-border px-5 py-3">
        <button
          type="button"
          onClick={() => selectRegion(VISITOR_REGION_ALL)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeRegion === VISITOR_REGION_ALL
              ? "bg-accent text-bg-primary"
              : "border border-glass-border text-text-secondary hover:border-accent/40 hover:text-accent",
          )}
        >
          {VISITOR_REGION_ALL}
        </button>
        {VISITOR_REGIONS.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => selectRegion(region)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeRegion === region
                ? "bg-accent text-bg-primary"
                : "border border-glass-border text-text-secondary hover:border-accent/40 hover:text-accent",
            )}
          >
            {region}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        <div
          ref={mapRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative cursor-grab touch-none select-none rounded-xl border border-glass-border bg-bg-primary/40 p-2 active:cursor-grabbing"
        >
          <svg
            viewBox={world.viewBox}
            role="group"
            aria-label={VISITOR_MAP_LABEL}
            className="h-auto w-full"
          >
            <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
              {world.locations.map((location) => {
                const country = byCode.get(location.id);
                const isSelected = selectedCode === location.id;
                const isHovered = hovered?.code === location.id;
                const opacity = mapOpacity(country);
                const label = country
                  ? `${country.country}: ${country.visits.toLocaleString("en-US")} visits`
                  : location.name ?? location.id;

                return (
                  <path
                    key={location.id}
                    d={location.path}
                    role="button"
                    tabIndex={country ? 0 : -1}
                    aria-label={label}
                    onClick={() => {
                      if (!country || suppressClickRef.current) return;
                      suppressClickRef.current = false;
                      setSelectedCode(selectedCode === country.code ? null : country.code);
                    }}
                    onKeyDown={(event) => {
                      if (!country) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCode(selectedCode === country.code ? null : country.code);
                      }
                    }}
                    onMouseEnter={(event) => handleMove(event, location.id)}
                    onMouseMove={(event) => handleMove(event, location.id)}
                    onMouseLeave={() => {
                      setHovered(null);
                      setHoveredCity(null);
                    }}
                    fill={
                      isSelected
                        ? "var(--color-accent)"
                        : country
                          ? "var(--color-accent)"
                          : "var(--color-text-muted)"
                    }
                    fillOpacity={isSelected ? 1 : isHovered ? opacity + 0.12 : opacity}
                    stroke="var(--color-bg-primary)"
                    strokeWidth={isSelected ? 1.2 / view.scale : 0.4 / view.scale}
                    strokeOpacity={isSelected ? 0.9 : 0.6}
                    className={cn(
                      "transition-[fill-opacity] duration-150",
                      country && "cursor-pointer",
                    )}
                    style={
                      isSelected
                        ? { filter: "drop-shadow(0 0 5px rgba(167,139,250,0.8))" }
                        : undefined
                    }
                  />
                );
              })}

              {showCells &&
                cellsByCountry.map(
                  (entry) =>
                    (activeRegion === VISITOR_REGION_ALL ||
                      entry.country.region === activeRegion) && (
                      <g key={entry.code}>
                        {entry.cells.map((cell) => (
                          <path
                            key={`${entry.code}-${cell.cityName}`}
                            d={ringsToPath(cell.rings)}
                            fillRule="evenodd"
                            fill="var(--color-accent)"
                            fillOpacity={
                              0.35 +
                              0.6 *
                                Math.min(
                                  (cell.visits / entry.country.visits) * 3,
                                  1,
                                )
                            }
                            stroke="var(--color-bg-primary)"
                            strokeWidth={1 / view.scale}
                            strokeOpacity={0.9}
                            onClick={() => {
                              if (suppressClickRef.current) return;
                              suppressClickRef.current = false;
                              setSelectedCode(
                                selectedCode === entry.code ? null : entry.code,
                              );
                            }}
                            onMouseEnter={(event) =>
                              handleCityMove(event, entry, cell)
                            }
                            onMouseMove={(event) =>
                              handleCityMove(event, entry, cell)
                            }
                            onMouseLeave={() => {
                              setHovered(null);
                              setHoveredCity(null);
                            }}
                            className="cursor-pointer"
                          />
                        ))}
                      </g>
                    ),
                )}
            </g>
          </svg>

          <div className="absolute right-3 top-3 flex flex-col gap-1.5 rounded-xl border border-glass-border bg-glass-bg/90 p-1.5 shadow-lg backdrop-blur-xl">
            <button
              type="button"
              onClick={() => zoomByButton(1.3)}
              disabled={view.scale >= MAX_SCALE}
              aria-label="Zoom in"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => zoomByButton(1 / 1.3)}
              disabled={view.scale <= MIN_SCALE}
              aria-label="Zoom out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              disabled={view.scale === MIN_SCALE && view.tx === 0 && view.ty === 0}
              aria-label="Reset zoom"
              className="flex h-8 w-8 items-center justify-center rounded-lg border-t border-glass-border text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {view.scale > 1 && (
            <span className="absolute bottom-3 left-3 rounded-full border border-glass-border bg-glass-bg/90 px-2.5 py-1 text-[11px] tabular-nums text-text-muted backdrop-blur-xl">
              {view.scale.toFixed(1)}×
            </span>
          )}

          {hoveredCity && (
            <div
              className="pointer-events-none absolute z-10 w-[200px] rounded-xl border border-glass-border/60 bg-glass-bg/95 px-3 py-2 shadow-xl backdrop-blur-xl"
              style={{ left: hoveredCity.x, top: hoveredCity.y }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{hoveredCity.flag}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-text-primary">
                    {hoveredCity.name}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {hoveredCity.country}
                  </p>
                </div>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums text-accent">
                {hoveredCity.visits.toLocaleString("en-US")}
                <span className="ml-1 text-xs font-normal text-text-muted">
                  {pct(hoveredCity.visits, TOTAL_VISITS).toFixed(1)}%
                </span>
              </p>
              <p className="text-[11px] text-text-muted">{hoveredCity.region}</p>
            </div>
          )}

          {hovered && !hoveredCity && (
            <div
              className="pointer-events-none absolute z-10 w-[200px] rounded-xl border border-glass-border/60 bg-glass-bg/95 px-3 py-2 shadow-xl backdrop-blur-xl"
              style={{ left: hovered.x, top: hovered.y }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">
                  {hoveredCountry?.flag ?? "🌐"}
                </span>
                <p className="truncate text-xs font-semibold text-text-primary">
                  {hoveredCountry?.country ?? hovered.code}
                </p>
              </div>
              {hoveredCountry ? (
                <>
                  <p className="mt-1 text-lg font-bold tabular-nums text-accent">
                    {hoveredCountry.visits.toLocaleString("en-US")}
                    <span className="ml-1 text-xs font-normal text-text-muted">
                      {pct(hoveredCountry.visits, TOTAL_VISITS).toFixed(1)}%
                    </span>
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {hoveredCountry.region}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-text-muted">{NO_DATA_LABEL}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-glass-border">
        {selected ? (
          <div>
            <button
              type="button"
              onClick={() => setSelectedCode(null)}
              className="flex w-full items-center gap-2 border-b border-glass-border px-5 py-3 text-left text-xs text-text-secondary transition-colors hover:text-accent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {VISITOR_BACK_LABEL}
            </button>

            <div className="flex items-center gap-3 px-5 py-4">
              <span className="text-2xl">{selected.flag ?? "🌐"}</span>
              <div className="min-w-0">
                <p className="font-semibold">{selected.country}</p>
                <p className="text-xs text-text-muted">{selected.region}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
                {selected.visits.toLocaleString("en-US")}
              </span>
            </div>

            {selected.cities.length > 0 ? (
              <>
                <p className="px-5 pb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
                  {VISITOR_CITIES_LABEL(selected.country)}
                </p>
                <ul className="grid grid-cols-1 gap-x-6 divide-y divide-glass-border/60 sm:grid-cols-2 sm:gap-y-0">
                  {selected.cities.map((city) => (
                    <li
                      key={city.name}
                      className="flex items-center justify-between gap-3 px-5 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {city.name}
                        </p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${pct(city.visits, selected.visits)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-text-secondary">
                        {city.visits.toLocaleString("en-US")}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="px-5 pb-4 text-sm text-text-muted">
                {VISITOR_NO_CITIES_LABEL}
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-glass-border/60">
            {ranked.map((country) => {
              const share = pct(country.visits, TOTAL_VISITS);
              return (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => setSelectedCode(country.code)}
                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="w-8 shrink-0 text-center text-xl">
                      {country.flag ?? "🌐"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium">
                          {country.country}
                        </p>
                        <span className="shrink-0 text-sm tabular-nums text-text-secondary">
                          {country.visits.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
