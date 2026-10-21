export type CharacteristicSeed = {
  key: string;
  label: string;
  group: string;
  parentKey?: string;
  isRollup?: boolean;
};

export const CHARACTERISTICS: CharacteristicSeed[] = [
  { key: "women", label: "Mulher", group: "perfil" },
  { key: "juveniles", label: "Crianças e adolescentes", group: "perfil" },
  { key: "helmet", label: "Capacete", group: "comportamento" },
  { key: "sidewalk", label: "Calçada", group: "comportamento" },
  { key: "mask", label: "Máscara", group: "comportamento" },

  { key: "caronas", label: "Caronas", group: "carona", isRollup: true },
  { key: "carona_crianca", label: "Carona criança", group: "carona", parentKey: "caronas" },
  { key: "carona_mulher", label: "Carona mulher", group: "carona", parentKey: "caronas" },
  { key: "carona_homem", label: "Carona homem", group: "carona", parentKey: "caronas" },

  { key: "cargueiras", label: "Cargueiras", group: "cargueira", isRollup: true },
  { key: "cargueira_tradicional", label: "Cargueira tradicional", group: "cargueira", parentKey: "cargueiras" },
  { key: "cargueira_adaptada", label: "Adaptada a carga", group: "cargueira", parentKey: "cargueiras" },

  { key: "servicos", label: "Serviço (total)", group: "servico", isRollup: true },
  { key: "servico", label: "Serviço", group: "servico", parentKey: "servicos" },
  { key: "servico_app", label: "Serviço APP", group: "servico", parentKey: "servicos" },

  { key: "contramaos", label: "Contramão (total)", group: "contramao", isRollup: true },
  { key: "contramao", label: "Contramão", group: "contramao", parentKey: "contramaos" },
  { key: "contramao_conversao", label: "Contramão para conversão", group: "contramao", parentKey: "contramaos" },
  { key: "contramao_ciclofaixa", label: "Contramão na ciclofaixa", group: "contramao", parentKey: "contramaos" },

  { key: "bike_pe", label: "Bike PE", group: "programa" },
  { key: "grupos_pedal", label: "Grupos de pedal", group: "programa" },
  { key: "faixa_azul", label: "Faixa Azul", group: "programa" },

  { key: "empurrando", label: "Empurrando", group: "modal" },
  { key: "triciclo", label: "Triciclo", group: "modal" },
  { key: "carroca", label: "Carroça", group: "modal" },
  { key: "triciclo_ou_carroca", label: "Triciclo e carroça", group: "modal" },
  { key: "triciclo_ou_patinete_eletrico", label: "Triciclo / patinete elétrico", group: "modal" },
  { key: "eletrica", label: "Elétrica", group: "modal" },
  { key: "motorizada", label: "Motorizada", group: "modal" },
  { key: "motorizada_ou_eletrica", label: "Motorizada ou elétrica", group: "modal" },
  { key: "ciclomotor", label: "Ciclomotor", group: "modal" },
  { key: "skate_patinavel", label: "Skate e outros patináveis", group: "modal" },
  { key: "cadeirante", label: "Cadeirante", group: "modal" },
  { key: "handbike", label: "Handbike", group: "modal" },
  { key: "tandem", label: "Tandem", group: "modal" },
  { key: "correndo", label: "Correndo", group: "modal" },

  { key: "ciclofaixa", label: "Ciclofaixa", group: "infraestrutura" },
  { key: "ciclovia", label: "Ciclovia", group: "infraestrutura" },
  { key: "contraciclo", label: "Contraciclo", group: "infraestrutura" },
  { key: "brt", label: "BRT", group: "infraestrutura" },
  { key: "brt_mao", label: "Faixa BRT na mão", group: "infraestrutura" },
  { key: "brt_contramao", label: "Faixa BRT na contramão", group: "infraestrutura" },
  { key: "invasao_ciclofaixa", label: "Invasão de carros na ciclofaixa", group: "infraestrutura" },

  { key: "guarda_chuva", label: "Guarda-chuva", group: "chuva" },
  { key: "capa_chuva", label: "Capa de chuva", group: "chuva" },

  { key: "reboque", label: "Reboque", group: "outros" },
  { key: "pcd", label: "PCD", group: "outros" },
  { key: "catador", label: "Catador", group: "outros" },
  { key: "aviao", label: "Avião", group: "outros" },
  { key: "outros", label: "Outros", group: "outros" },
];

export const ALIASES: Record<string, string> = {
  mulher: "women",
  mulheres: "women",
  "criancas e adolescentes": "juveniles",
  capacete: "helmet",
  capacetes: "helmet",
  calcada: "sidewalk",
  mascara: "mask",
  "usando mascara": "mask",
  "bike pe": "bike_pe",
  empurrando: "empurrando",
  "pedestre empurrando": "empurrando",
  triciclo: "triciclo",
  carroca: "carroca",
  "cavalo/carroca": "carroca",
  "triciclo e carroca": "triciclo_ou_carroca",
  "triciclo/patinete eletrico": "triciclo_ou_patinete_eletrico",
  eletrica: "eletrica",
  eletrico: "eletrica",
  motorizada: "motorizada",
  motor: "motorizada",
  "bicicleta motorizada": "motorizada",
  "motor adaptado": "motorizada",
  "motorizada ou eletrica": "motorizada_ou_eletrica",
  ciclomotor: "ciclomotor",
  skate: "skate_patinavel",
  patinete: "skate_patinavel",
  "skate e outros patinaveis": "skate_patinavel",
  cadeirante: "cadeirante",
  caeirante: "cadeirante",
  handbike: "handbike",
  tandem: "tandem",
  correndo: "correndo",
  "grupos de pedal": "grupos_pedal",
  "grupo de pedal": "grupos_pedal",
  "grupo(s) de pedal": "grupos_pedal",
  "faixa azul": "faixa_azul",
  ciclofaixa: "ciclofaixa",
  "utilizando a ciclofaixa": "ciclofaixa",
  ciclovia: "ciclovia",
  contraciclo: "contraciclo",
  brt: "brt",
  "faixa brt - mao": "brt_mao",
  "faixa do brt na mao": "brt_mao",
  "faixa brt - contramao": "brt_contramao",
  "faixa do brt na contramao": "brt_contramao",
  "invasao de carros na ciclofaixa": "invasao_ciclofaixa",
  "guarda-chuva": "guarda_chuva",
  "sombrinha na mao": "guarda_chuva",
  "capa de chuva": "capa_chuva",
  reboque: "reboque",
  pcd: "pcd",
  catador: "catador",
  aviao: "aviao",
};

export function normalizeLabel(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/["'“”]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type Block = "padroes" | "observacoes";

// Layouts differ in where the rollup rows (Caronas, Cargueiras, Serviço,
// Contramão) live. Until 2024 the padrões block holds rollups and observações
// the detail; the 2026 layout flips that. For labels that appear both as a
// rollup and as a leaf, the block plus the layout decide.
export function resolveCharacteristic(
  raw: string,
  block: Block,
  detailInPadroes: boolean,
  aliases: Record<string, string> = ALIASES,
): string | null {
  const n = normalizeLabel(raw);
  const rollupContext = (block === "padroes") !== detailInPadroes;

  if (/^(outros|diversos)/.test(n)) return "outros";
  if (n === "caronas" || n === "carona") return "caronas";
  if (n === "carona crianca") return rollupContext ? "caronas" : "carona_crianca";
  if (n === "carona mulher") return "carona_mulher";
  if (n === "carona homem") return "carona_homem";
  if (n === "cargueiras") return "cargueiras";
  if (n === "cargueira") return rollupContext ? "cargueiras" : "cargueira_tradicional";
  if (n === "cargueira tradicional") return "cargueira_tradicional";
  if (n.startsWith("adaptada a carga")) return "cargueira_adaptada";
  if (n === "servicos") return "servicos";
  if (n === "servico") return rollupContext ? "servicos" : "servico";
  if (n === "servico app") return "servico_app";
  if (n === "contramaos") return "contramaos";
  if (n === "contramao") return rollupContext ? "contramaos" : "contramao";
  if (/^contramao (para )?conversao/.test(n)) return "contramao_conversao";
  if (n.startsWith("contramao na ciclofaixa")) return "contramao_ciclofaixa";
  if (n.startsWith("bike pe")) return "bike_pe";
  if (n.startsWith("faixa azul")) return "faixa_azul";
  if (n.startsWith("ciclofaixa")) return "ciclofaixa";

  return aliases[n] ?? null;
}
