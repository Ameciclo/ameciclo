// Pure module: safe to import from browser code (no database or Node imports).

export type Topology = "point" | "t_junction" | "crossroad";

export const TOPOLOGY_LABEL: Record<Topology, string> = {
  point: "Ponto",
  t_junction: "Junção em T",
  crossroad: "Cruzamento",
};

// Where an approach sits around the intersection, with north up.
export type Position = "N" | "E" | "S" | "W";

export const POSITIONS: readonly Position[] = ["N", "E", "S", "W"];

export function isPosition(value: string): value is Position {
  return value === "N" || value === "E" || value === "S" || value === "W";
}

// Used while the real positions are unknown: the order of the approaches around the sketch.
export const DEFAULT_POSITIONS: Record<Topology, readonly Position[]> = {
  point: ["W", "E"],
  t_junction: ["W", "E", "S"],
  crossroad: ["N", "E", "S", "W"],
};

// Gives approach `index` a position; the approach that held it takes the old one.
export function assignPosition(current: readonly Position[], index: number, position: Position): Position[] {
  const holder = current.indexOf(position);
  return current.map((p, i) => {
    if (i === index) return position;
    if (i === holder) return current[index];
    return p;
  });
}

export const POSITION_LABEL: Record<Position, string> = {
  N: "Norte",
  E: "Leste",
  S: "Sul",
  W: "Oeste",
};

export type PublicCharacteristics = {
  women: number;
  juveniles: number;
  ride: number;
  helmet: number;
  service: number;
  cargo: number;
  shared_bike: number;
  sidewalk: number;
  wrong_way: number;
  motor: number;
};

// One place for the metric names, icons and order used by the site and the admin.
// `card` marks the ones shown as percentage cards.
export const METRICS = [
  { key: "women", label: "Mulheres", icon: "women", card: true },
  { key: "juveniles", label: "Crianças e Adolescentes", icon: "children", card: true },
  { key: "ride", label: "Carona", icon: "ride", card: true },
  { key: "helmet", label: "Capacete", icon: "helmet", card: true },
  { key: "service", label: "Serviço", icon: "service", card: true },
  { key: "cargo", label: "Cargueira", icon: "cargo", card: true },
  { key: "shared_bike", label: "Compartilhada", icon: "shared_bike", card: true },
  { key: "sidewalk", label: "Calçada", icon: "sidewalk", card: true },
  { key: "wrong_way", label: "Contramão", icon: "wrong_way", card: true },
  { key: "motor", label: "Motor", icon: "motor", card: false },
] as const satisfies readonly {
  key: keyof PublicCharacteristics;
  label: string;
  icon: string;
  card: boolean;
}[];

export type PublicCount = {
  id: number;
  date: string;
  variant: string | null;
  total_cyclists: number;
  max_hour_cyclists: number;
  // True when the total is a projection of a peak-hour count.
  estimated: boolean;
  // True when only some hours were counted and nothing was projected.
  partial: boolean;
  characteristics: PublicCharacteristics;
};

// Same shape the site used to read from the Atlas API, so pages need no changes.
export type PublicLocation = {
  id: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  counts: PublicCount[];
};

export type PublicSeries = { name: string; data: number[]; visible?: boolean };

export type PublicCountDetail = {
  id: number;
  date: string;
  approaches: string[];
  // Null when the position of each approach is unknown.
  positions: Position[] | null;
  topology: Topology;
  hours: number[];
  series: PublicSeries[];
  flows: { from: number; to: number; value: number }[];
  estimated: boolean;
  // Hours with real counts when the count is partial or projected; null when all hours were counted.
  observedHours: number[] | null;
  partial: boolean;
};
