// Vocabulário das leituras, sem dependências: o navegador também importa daqui.

export const MODES = ["pedestre", "ciclista", "motociclista", "automovel", "onibus", "outros"] as const;
export type Mode = (typeof MODES)[number];

export const COUNTERPARTS = [
  "pedestre",
  "ciclista",
  "motociclista",
  "automovel",
  "onibus",
  "outros",
  "objeto_fixo",
  "sem_colisao",
  "nao_especificado",
] as const;
export type Counterpart = (typeof COUNTERPARTS)[number];
