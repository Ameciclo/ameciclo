import type { Counterpart, Mode } from "@ameciclo/db/deaths-model";

export const MODE_LABELS: Record<Mode, string> = {
  pedestre: "Pedestres",
  ciclista: "Ciclistas",
  motociclista: "Motociclistas",
  automovel: "Ocupantes de automóvel ou caminhonete",
  onibus: "Ocupantes de ônibus",
  outros: "Outros veículos",
};

// Curtos, para colunas e legendas.
export const MODE_SHORT: Record<Mode, string> = {
  pedestre: "Pedestre",
  ciclista: "Ciclista",
  motociclista: "Motociclista",
  automovel: "Automóvel",
  onibus: "Ônibus",
  outros: "Outros",
};

export const COUNTERPART_LABELS: Record<Counterpart, string> = {
  pedestre: "Pedestre",
  ciclista: "Ciclista",
  motociclista: "Motociclista",
  automovel: "Automóvel",
  onibus: "Ônibus ou veículo pesado",
  outros: "Trem ou outro veículo",
  objeto_fixo: "Objeto fixo",
  sem_colisao: "Sem colisão",
  nao_especificado: "Não especificado",
};

// Contraste de luminosidade entre as cores, não só de matiz: o gráfico também se lê em tons de cinza.
export const MODE_COLORS: Record<Mode, string> = {
  motociclista: "#b3261e",
  pedestre: "#d99a00",
  ciclista: "#00695f",
  automovel: "#4a5a63",
  onibus: "#8e79b8",
  outros: "#b9c1c5",
};

export const n = (value: number) => value.toLocaleString("pt-BR");
export const pct = (part: number, whole: number) =>
  whole === 0 ? "0%" : `${((part / whole) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;

// Os diagnósticos que mais aparecem nas declarações, pelas três primeiras posições do CID-10.
export const CID_NAMES: Record<string, string> = {
  S069: "Traumatismo intracraniano, não especificado",
  S099: "Traumatismo da cabeça, não especificado",
  S019: "Ferimento da cabeça, parte não especificada",
  S299: "Traumatismo do tórax, não especificado",
  T794: "Choque traumático",
  T792: "Hemorragia traumática secundária ou recorrente",
  T798: "Outras complicações precoces de traumatismos",
  T099: "Traumatismo do tronco, não especificado",
  T091: "Ferimento do tronco, nível não especificado",
  T093: "Traumatismo da medula espinhal, nível não especificado",
  A419: "Septicemia, não especificada",
  S01: "Ferimento da cabeça",
  S02: "Fratura do crânio e dos ossos da face",
  S06: "Traumatismo intracraniano",
  S09: "Outros traumatismos da cabeça",
  S12: "Fratura do pescoço",
  S14: "Traumatismo de nervos e da medula espinhal do pescoço",
  S19: "Outros traumatismos do pescoço",
  S22: "Fratura de costela, esterno e coluna torácica",
  S24: "Traumatismo de nervos e da medula espinhal do tórax",
  S27: "Traumatismo de outros órgãos intratorácicos",
  S29: "Outros traumatismos do tórax",
  S32: "Fratura da coluna lombar e da pelve",
  S36: "Traumatismo de órgãos intra-abdominais",
  S39: "Outros traumatismos do abdome, do dorso e da pelve",
  S42: "Fratura do ombro e do braço",
  S72: "Fratura do fêmur",
  S82: "Fratura da perna",
  T06: "Outros traumatismos de várias regiões do corpo",
  T07: "Traumatismos múltiplos",
  T09: "Outros traumatismos da coluna e do tronco",
  T14: "Traumatismo de região não especificada do corpo",
  T79: "Complicações precoces de traumatismos",
  A41: "Septicemia",
  J18: "Pneumonia",
  J96: "Insuficiência respiratória",
  I46: "Parada cardíaca",
  R57: "Choque",
};
