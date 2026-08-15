declare module "world-atlas/countries-50m.json" {
  interface WorldAtlasJson {
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
      land: {
        type: "GeometryCollection";
        geometries: Array<{ type: string; arcs: number[][] }>;
      };
    };
  }
  const value: WorldAtlasJson;
  export default value;
}
