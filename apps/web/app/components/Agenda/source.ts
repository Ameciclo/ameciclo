import type { AgendaSource } from "~/queries/agenda";

export const SOURCE_LABEL: Record<AgendaSource, string> = {
  internal: "Ameciclo",
  external: "Evento externo",
};

// Color is never the only signal: every card also carries the label above.
export const SOURCE_BAR: Record<AgendaSource, string> = {
  internal: "border-l-ameciclo",
  external: "border-l-red-600",
};

export const SOURCE_DOT: Record<AgendaSource, string> = {
  internal: "bg-ameciclo",
  external: "bg-red-600",
};
