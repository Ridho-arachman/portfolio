"use client";

import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { VisitorCountry } from "./constants";

const VisitorMapLeaflet = dynamic(
  () => import("./visitor-map-leaflet").then((m) => m.VisitorMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-bg-primary/40" />
    ),
  },
);

const REGION_ALL = "All";

function pct(visits: number, total: number) {
  return total > 0 ? (visits / total) * 100 : 0;
}

interface VisitorMapProps {
  visitorLocations: VisitorCountry[];
  totalVisits: number;
  deltaLabel: string;
  regions: string[];
}

export function VisitorMap({ visitorLocations, totalVisits, deltaLabel, regions }: VisitorMapProps) {
  const [activeRegion, setActiveRegion] = useState(REGION_ALL);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const byCode = useMemo(
    () => new Map(visitorLocations.map((country) => [country.code, country])),
    [visitorLocations],
  );

  const ranked = useMemo(() => {
    const filtered =
      activeRegion === REGION_ALL
        ? visitorLocations
        : visitorLocations.filter(
            (country) => country.region === activeRegion,
          );
    return [...filtered].sort((a, b) => b.visits - a.visits);
  }, [activeRegion, visitorLocations]);

  const selected = selectedCode ? (byCode.get(selectedCode) ?? null) : null;

  const selectCountry = (code: string) => {
    if (selectedCode === code) {
      setSelectedCode(null);
      return;
    }
    setSelectedCode(code);
  };

  const clearSelection = () => setSelectedCode(null);

  const selectRegion = (region: string) => {
    setActiveRegion(region);
    clearSelection();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <header className="flex flex-col gap-4 border-b border-glass-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Visitors by Location</h2>
            <p className="text-xs text-text-muted">Global · Last 30 days</p>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {totalVisits.toLocaleString("en-US")}
            </p>
            <p className="text-xs text-text-muted">Total visits (30d)</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
            {deltaLabel}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-glass-border px-5 py-3">
        <button
          type="button"
          onClick={() => selectRegion(REGION_ALL)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeRegion === REGION_ALL
              ? "bg-accent text-bg-primary"
              : "border border-glass-border text-text-secondary hover:border-accent/40 hover:text-accent",
          )}
        >
          {REGION_ALL}
        </button>
        {regions.map((region) => (
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
        <div className="relative h-[460px] overflow-hidden rounded-xl border border-glass-border bg-bg-primary/40">
          <VisitorMapLeaflet
            countries={visitorLocations}
            byCode={byCode}
            activeRegion={activeRegion}
            selectedCode={selectedCode}
            onSelectCountry={selectCountry}
            totalVisits={totalVisits}
          />
        </div>
      </div>

      <div className="border-t border-glass-border">
        {selected ? (
          <div>
            <button
              type="button"
              onClick={clearSelection}
              className="flex w-full items-center gap-2 border-b border-glass-border px-5 py-3 text-left text-xs text-text-secondary transition-colors hover:text-accent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              All countries
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
                  Cities · {selected.country}
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
                City data is not tracked for this entry yet.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-glass-border/60">
            {ranked.map((country) => {
              const share = pct(country.visits, totalVisits);
              return (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(country.code)}
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
