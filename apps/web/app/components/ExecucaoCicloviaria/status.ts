// Shared by the bar, the map and the tables: how numbers are written and what each status looks like.

const oneDecimal = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 131,8 km */
export const km = (n: number) => `${oneDecimal(n)} km`;
/** 131,8 (a table column that already says km) */
export const kmValue = oneDecimal;
/** 21,0% for 21.04; the argument is 0 to 100 */
export const percent = (n: number) => `${oneDecimal(n)}%`;

// What happened to the length the PDC planned. Lightness differs between segments as well as hue,
// so the bar reads without colour; every segment is also written out with its km below the bar.
export const SEGMENTS = [
  { key: "designatedKm", label: "Implantado como previsto", color: "#00695f" },
  { key: "undesignatedKm", label: "Implantado com outra tipologia", color: "#6cc5bd" },
  { key: "notExecutedKm", label: "Ainda não implantado", color: "#e7a3a4" },
] as const;

export type SegmentKm = Record<(typeof SEGMENTS)[number]["key"], number>;
