import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";

const CODE_BY_NAME: Record<string, string> = {
  Indonesia: "id",
  "United States of America": "us",
  India: "in",
  Singapore: "sg",
  Malaysia: "my",
  Japan: "jp",
  Netherlands: "nl",
  "United Kingdom": "gb",
  Germany: "de",
  Australia: "au",
  "Saudi Arabia": "sa",
};

export interface WorldCountry {
  id: string;
  name: string;
  code?: string;
}

const topo = worldTopo as unknown as {
  type: "Topology";
  arcs: number[][][];
  transform: { scale: [number, number]; translate: [number, number] };
  objects: {
    countries: {
      type: "GeometryCollection";
      geometries: Array<{
        type: string;
        id: string;
        properties: { name: string };
        arcs: number[][];
      }>;
    };
  };
};

// @ts-expect-error - topojson-client types don't perfectly match world-atlas JSON structure but runtime works
const countries = feature(topo, topo.objects.countries) as {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id?: string | number;
    properties: { name: string };
    geometry: unknown;
  }>;
};

export const worldCountries: WorldCountry[] = countries.features.map(
  (country) => ({
    id: String(country.id ?? ""),
    name: country.properties.name,
    code: CODE_BY_NAME[country.properties.name],
  }),
);

export const countryFeaturesByCode = new Map<
  string,
  (typeof countries.features)[number]
>();
countries.features.forEach((country, index) => {
  const code = worldCountries[index]?.code;
  if (code) countryFeaturesByCode.set(code, country);
});

export const worldCountryFeatures = countries.features;
