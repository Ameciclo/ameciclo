// GERADO por ops/windmill/build.sh (transform.ts + o passo abaixo). Não edite aqui.
type DeathRow = Record<string, string>;

type DeathDraft = {
  year: number;
  month: number;
  occurrenceCity: number | null;
  residenceCity: number | null;
  deathPlace: string | null;
  cause: string;
  secondaryCauses: string | null;
  sex: string | null;
  raceColor: string | null;
  ageYears: number | null;
};

// Municípios da RMR, com o código de 6 dígitos que o SIM usa (o IBGE sem o dígito verificador).
const RMR_SIM_CODES = [
  260005, 260105, 260290, 260345, 260680, 260720, 260760, 260775, 260790, 260940, 260960, 261070, 261160, 261370,
];

const rmr = new Set(RMR_SIM_CODES);

// O SIM escreve NA ou vazio para o que não foi preenchido.
function clean(value: string | undefined): string | null {
  const v = value?.trim();
  return v && v !== "NA" ? v : null;
}

function code(value: string | undefined): number | null {
  const v = clean(value);
  return v && /^\d{6}$/.test(v) ? Number(v) : null;
}

// DDMMAAAA
function parseDeathDate(value: string | undefined): { year: number; month: number } | null {
  const v = clean(value);
  if (!v || !/^\d{8}$/.test(v)) return null;
  const month = Number(v.slice(2, 4));
  const year = Number(v.slice(4));
  return month >= 1 && month <= 12 ? { year, month } : null;
}

// IDADE do SIM: o primeiro dígito é a unidade (4 = anos, 5 = 100 anos ou mais; 0 a 3 = menos de 1 ano).
function parseAge(value: string | undefined): number | null {
  const v = clean(value);
  if (!v || !/^\d{3}$/.test(v)) return null;
  if (v[0] === "4") return Number(v.slice(1));
  if (v[0] === "5") return 100 + Number(v.slice(1));
  return v[0] === "0" || v[0] === "1" || v[0] === "2" || v[0] === "3" ? 0 : null;
}

const noStar = (value: string | undefined) => clean(value)?.replace(/^\*/, "") ?? null;

type DraftResult = { draft: DeathDraft } | { skipped: string };

function toDraft(raw: DeathRow): DraftResult {
  const date = parseDeathDate(raw.DTOBITO);
  if (!date) return { skipped: "sem data de óbito" };
  const cause = noStar(raw.CAUSABAS);
  // V01 a V89: acidentes de transporte terrestre; V99: acidente de transporte não especificado.
  // V90 a V98 (água, ar) e Y85 (sequelas, sem saber quem era a vítima) ficam de fora.
  if (!cause || !/^V(?:[0-8]\d|99)/.test(cause)) return { skipped: "causa básica fora de V01-V89 e V99" };
  const occurrenceCity = code(raw.CODMUNOCOR);
  const residenceCity = code(raw.CODMUNRES);
  const inRmr = (occurrenceCity !== null && rmr.has(occurrenceCity)) || (residenceCity !== null && rmr.has(residenceCity));
  if (!inRmr) return { skipped: "fora da RMR" };

  const lines = [raw.LINHAA, raw.LINHAB, raw.LINHAC, raw.LINHAD, raw.LINHAII].map(noStar).filter((l) => l !== null);
  return {
    draft: {
      ...date,
      occurrenceCity,
      residenceCity,
      deathPlace: clean(raw.LOCOCOR),
      cause,
      secondaryCauses: lines.length ? lines.join(" ") : null,
      sex: clean(raw.SEXO),
      raceColor: clean(raw.RACACOR),
      ageYears: parseAge(raw.IDADE),
    },
  };
}

/** Aplica as regras de limpeza a cada registro e conta o que foi descartado e por quê. */
export async function main(linhas: Record<string, string>[]) {
  const obitos: DeathDraft[] = [];
  const descartadas: Record<string, number> = {};
  for (const linha of linhas) {
    const r = toDraft(linha);
    if ("skipped" in r) descartadas[r.skipped] = (descartadas[r.skipped] ?? 0) + 1;
    else obitos.push(r.draft);
  }
  return { recebidas: linhas.length, aceitas: obitos.length, descartadas, obitos };
}
