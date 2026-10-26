// Which OpenStreetMap ways are the same street. Used to suggest trechos: the
// same normalized name, in the same city, with the same built typology and the
// same hierarchy of road.

const PREFIXES: Record<string, string> = {
  av: "avenida",
  r: "rua",
  pc: "praca",
  pca: "praca",
  tv: "travessa",
  est: "estrada",
  rod: "rodovia",
  al: "alameda",
  lg: "largo",
  dr: "doutor",
  prof: "professor",
  eng: "engenheiro",
  cel: "coronel",
  gov: "governador",
  pres: "presidente",
  sen: "senador",
  des: "desembargador",
};

/** "Av. Gov. Agamenon Magalhães" and "Avenida Governador Agamenon Magalhaes" are the same street. */
export function normalizeStreetName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((word) => PREFIXES[word] ?? word)
    .join(" ");
}

export type RoadClass = "estrutural" | "alimentadora" | "local" | "segregada";

/** Hierarchy of the road the way follows, from the OpenStreetMap highway tag. */
export function roadClass(highway: string | null): RoadClass | null {
  if (!highway) return null;
  const base = highway.replace(/_link$/, "");
  if (["motorway", "trunk", "primary", "secondary"].includes(base)) return "estrutural";
  if (base === "tertiary") return "alimentadora";
  if (["unclassified", "residential", "living_street", "service", "pedestrian"].includes(base)) return "local";
  if (["cycleway", "path", "footway"].includes(base)) return "segregada";
  return null;
}
