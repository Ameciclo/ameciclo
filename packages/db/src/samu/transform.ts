// Cleaning of the SAMU spreadsheet (one TSV row per call). Pure, so it can be
// tested without a file or a database.

export type SamuRow = Record<string, string>;

export type SamuCallDraft = {
  sourceId: number;
  sourceRow: number;
  occurredOn: string;
  occurredAt: string | null;
  municipality: string | null;
  neighborhood: string | null;
  address: string | null;
  street: string | null;
  origin: string | null;
  subtype: string | null;
  category: string;
  gender: string | null;
  age: number | null;
  finalization: string | null;
  outcome: string | null;
};

// Names that mean "the street could not be identified" rather than a street.
const NO_STREET = new Set(["NAO IDENTIFICADO", "#N/A", "OUTRO MUNICIPIO"]);

// The two extractions spell the origin differently.
const ORIGINS: Record<string, string> = {
  "VIA PUBLICA": "Via pública",
  "VIA PUBL": "Via pública",
  RESIDENCIAL: "Residência",
  "UNIDADE DE SAUDE": "Unidade de saúde",
  "UNIDADE DE SAÚDE": "Unidade de saúde",
  "UNIDADE DE SAUDE PRIVADA": "Unidade de saúde",
};

// Older extractions have no age: they write 0. A handful of rows have typos (647).
const MAX_AGE = 110;

const clean = (value: string | undefined) => {
  const v = value?.trim();
  return v ? v : null;
};

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

// "2018-01-01T00:00:00Z" → "2018-01-01". null if it is not a date.
export function parseDate(value: string | undefined): string | null {
  const m = value?.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCMonth() === Number(m[2]) - 1 ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// "0:09" and "00:27:21" → "HH:MM:SS".
export function parseTime(value: string | undefined): string | null {
  const m = value?.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [h, min, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  if (h > 23 || min > 59 || s > 59) return null;
  return [h, min, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function parseAge(value: string | undefined): number | null {
  const n = Number(value?.trim());
  return Number.isInteger(n) && n > 0 && n <= MAX_AGE ? n : null;
}

export function parseStreet(value: string | undefined): string | null {
  const v = clean(value);
  return v && !NO_STREET.has(v.toUpperCase()) ? v : null;
}

export type DraftResult = { draft: SamuCallDraft } | { skipped: string };

// `row` is the 1-based line of data in the file, used to report and to re-import.
export function toDraft(raw: SamuRow, row: number): DraftResult {
  const sourceId = Number(raw._id);
  if (!Number.isInteger(sourceId)) return { skipped: "id inválido" };
  const occurredOn = parseDate(raw.data);
  if (!occurredOn) return { skipped: "data inválida" };
  const category = clean(raw.categoria);
  if (!category) return { skipped: "sem categoria" };
  const origin = clean(raw.origem_chamado);

  return {
    draft: {
      sourceId,
      sourceRow: row,
      occurredOn,
      occurredAt: parseTime(raw.hora_minuto),
      municipality: clean(raw.municipio),
      neighborhood: clean(raw.bairro),
      address: clean(raw.endereco),
      street: parseStreet(raw.endereco_pcr),
      origin: origin ? (ORIGINS[origin.toUpperCase()] ?? null) : null,
      subtype: clean(raw.subtipo),
      category,
      gender: clean(raw.sexo),
      age: parseAge(raw.idade),
      finalization: clean(raw.motivo_fin_cat),
      outcome: clean(raw.motivo_desf_cat),
    },
  };
}
