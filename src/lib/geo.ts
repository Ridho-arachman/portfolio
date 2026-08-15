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

const topo = worldTopo as never;
const objects = (worldTopo as unknown as {
  objects: { countries: { type: "GeometryCollection"; geometries: unknown[] } };
}).objects;

const countries = feature(topo, objects.countries as never) as unknown as {
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
