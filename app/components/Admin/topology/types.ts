export type Topology = "point" | "t_junction" | "crossroad";

export type Direction = "N" | "E" | "S" | "W";

/** Fixed clockwise approach order per topology. */
export const TOPOLOGY_DIRECTIONS: Record<Topology, Direction[]> = {
  point: ["W", "E"],
  t_junction: ["W", "E", "S"],
  crossroad: ["N", "E", "S", "W"],
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  N: "Norte",
  E: "Leste",
  S: "Sul",
  W: "Oeste",
};

export const TOPOLOGY_LABELS: Record<Topology, string> = {
  point: "Ponto",
  t_junction: "Junção em T",
  crossroad: "Cruzamento",
};

export type Movements = Record<string, string>;

/** Build "fromIdx-toIdx" → "" entries for every from ≠ to. */
export function emptyMovements(approachCount: number): Movements {
  const out: Movements = {};
  for (let i = 0; i < approachCount; i++) {
    for (let j = 0; j < approachCount; j++) {
      if (i !== j) out[`${i}-${j}`] = "";
    }
  }
  return out;
}

export function approachVolume(
  fromIdx: number,
  approachCount: number,
  movements: Movements,
): number {
  let total = 0;
  for (let to = 0; to < approachCount; to++) {
    if (to === fromIdx) continue;
    total += toIntOrZero(movements[`${fromIdx}-${to}`]);
  }
  return total;
}

export function totalCyclists(movements: Movements): number {
  let total = 0;
  for (const key of Object.keys(movements)) {
    total += toIntOrZero(movements[key]);
  }
  return total;
}

function toIntOrZero(s: string | undefined): number {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}
