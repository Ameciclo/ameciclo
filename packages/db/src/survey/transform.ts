import {
  cleanOccupation,
  cleanPlace,
  cleanText,
  type DateFormat,
  inferDateFormat,
  isNoAnswer,
  parseDate,
  parseInteger,
  parseYesNo,
} from "./normalize";

export type CsvRow = Record<string, string>;

/** A categorical answer: a row of `profile_options`, resolved to an id when saved. */
export interface OptionRef {
  question: string;
  label: string;
}

export interface InterviewDraft {
  year: number;
  city: string;
  sourceEditionId: number | null;
  sourceId: number;
  rawDate: string | null;
  interviewedOn: string | null;
  weekday: string | null;
  pointSourceId: number | null;
  area: OptionRef | null;
  neighborhood: string | null;
  age: number | null;
  ageGroup: OptionRef | null;
  gender: OptionRef | null;
  schooling: OptionRef | null;
  income: OptionRef | null;
  colorRace: OptionRef | null;
  occupation: string | null;
  householdSize: number | null;
  neighborhoodLiving: string | null;
  daysPerWeek: number | null;
  daysWork: number | null;
  daysSchool: number | null;
  daysShopping: number | null;
  daysLeisure: number | null;
  daysStation: number | null;
  yearsUsing: OptionRef | null;
  tripMinutes: number | null;
  tripTimeGroup: OptionRef | null;
  neighborhoodOrigin: string | null;
  neighborhoodDestiny: string | null;
  sharedBike: boolean | null;
  electricBike: boolean | null;
  combinesModes: boolean | null;
  combinationMode: OptionRef | null;
  previousMode: OptionRef | null;
  sharedBikeInfluence: boolean | null;
  hadCollision: boolean | null;
  hadTheft: boolean | null;
  hadHarassment: boolean | null;
  biggestIssue: OptionRef | null;
  biggestNeed: OptionRef | null;
  motivationStart: OptionRef | null;
  motivationContinue: OptionRef | null;
  covidHouseholdCase: boolean | null;
  extra: Record<string, unknown> | null;
}

/** Counts problems by kind so the import can report them instead of failing on a bad cell. */
export class Warnings {
  readonly counts = new Map<string, number>();
  add(key: string): void {
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
  }
}

// ---------------------------------------------------------------------------
// Catalog (categories.csv): ids used by the legacy `to_db` sheet
// ---------------------------------------------------------------------------

const QUESTION_BY_TYPE: Record<string, string> = {
  area: "area",
  gender: "gender",
  age: "age_group",
  schooling: "schooling",
  wage: "income",
  color_race: "color_race",
  distance_time: "trip_time_group",
  years_using: "years_using",
  transportation_mode_cat: "transport_mode",
  collisions_last_years: "collisions",
  biggest_issue: "biggest_issue",
  biggest_need: "biggest_need",
  motivation_to_start: "motivation_start",
  motivation_to_continue: "motivation_continue",
};

export interface Catalog {
  /** category id -> option; null means the category is a "no answer" */
  byId: Map<string, OptionRef | null>;
  /** every real option, in sheet order, per question */
  options: OptionRef[];
}

export function buildCatalog(rows: CsvRow[]): Catalog {
  const byId = new Map<string, OptionRef | null>();
  const options: OptionRef[] = [];
  for (const r of rows) {
    const id = (r.id ?? "").trim();
    const question = QUESTION_BY_TYPE[(r.type ?? "").trim()];
    const label = cleanText(r.name);
    if (!id || !question) continue; // week_days_total_cat and stray cells
    if (!label) {
      byId.set(id, null);
      continue;
    }
    const ref = { question, label };
    byId.set(id, ref);
    options.push(ref);
  }
  return { byId, options };
}

/** Options only the 2024 wave uses (different income bands, one new need). */
export const OPTIONS_ONLY_IN_2024: OptionRef[] = [
  { question: "income", label: "de 2 a 5 salários mínimos" },
  { question: "income", label: "acima de 5 salários mínimos" },
  { question: "biggest_need", label: "Mais segurança pública" },
];

// ---------------------------------------------------------------------------
// Age and trip time groups, derived from the number so every wave uses the
// same bands (the 2024 sheet used different ones)
// ---------------------------------------------------------------------------

export function ageGroupFor(age: number): OptionRef {
  const label =
    age <= 14
      ? "até 14 anos"
      : age <= 24
        ? "de 15 a 24 anos"
        : age <= 34
          ? "de 25 a 34 anos"
          : age <= 44
            ? "de 35 a 44 anos"
            : age <= 54
              ? "de 45 a 54 anos"
              : age <= 64
                ? "de 55 a 64 anos"
                : "65 anos ou mais";
  return { question: "age_group", label };
}

export function tripTimeGroupFor(minutes: number): OptionRef {
  const label =
    minutes <= 10
      ? "até 10 minutos"
      : minutes <= 20
        ? "mais de 10 até 20 minutos"
        : minutes <= 30
          ? "mais de 20 até 30 minutos"
          : minutes <= 60
            ? "mais de 30 minutos até 1 hora"
            : "mais de 1 hora";
  return { question: "trip_time_group", label };
}

// ---------------------------------------------------------------------------
// Legacy waves (2015, 2018, 2021): `to_db` + `Dados trabalhados e padronizados`
// ---------------------------------------------------------------------------

/** The standardized sheet holds three answers `to_db` lost; it has the same rows in the same order. */
export interface LegacySupplement {
  year: string;
  city: string;
  age: string;
  combina: string;
  pandemia: string;
}

export function supplementFrom(row: CsvRow): LegacySupplement {
  return {
    year: (row["Ano da Pesquisa"] ?? "").trim(),
    city: (row.Cidade ?? "").trim(),
    age: (row.Idade ?? "").trim(),
    combina: row.Combina ?? "",
    pandemia: row.Pandemia ?? "",
  };
}

export function transformLegacyRow(
  row: CsvRow,
  supplement: LegacySupplement,
  catalog: Catalog,
  warn: Warnings,
): InterviewDraft | null {
  const year = parseInteger(row.year, 2000, 2100).value;
  const city = cleanText(row.city_name);
  const sourceId = parseInteger(row.id, 0, 10_000_000).value;
  if (year === null || !city || sourceId === null) {
    warn.add("legacy: row without year/city/id (skipped)");
    return null;
  }

  // The two sheets must describe the same interview, or the join is wrong
  if (
    supplement.year !== String(year) ||
    supplement.city !== (row.city_name ?? "").trim() ||
    (supplement.age && row.age && supplement.age !== row.age.trim())
  ) {
    throw new Error(
      `to_db and the standardized sheet are not aligned at ${year}/${city}/${sourceId}`,
    );
  }

  const int = (
    field: string,
    value: string | undefined,
    min: number,
    max: number,
  ) => {
    const r = parseInteger(value, min, max);
    if (r.bad) warn.add(`legacy: invalid ${field}`);
    return r.value;
  };
  const opt = (
    field: string,
    question: string,
    id: string | undefined,
  ): OptionRef | null => {
    const key = (id ?? "").trim();
    if (!key) return null;
    const ref = catalog.byId.get(key);
    if (ref === undefined) {
      warn.add(`legacy: ${field} has unknown category id`);
      return null;
    }
    if (ref !== null && ref.question !== question) {
      warn.add(`legacy: ${field} points at a ${ref.question} category`);
      return null;
    }
    return ref;
  };

  const age = int("age", row.age, 0, 110);
  // to_db names this column "..._id", but it holds the minutes of the trip
  const tripMinutes = int("trip minutes", row.distance_time_id, 0, 1440);
  const collisionRef = catalog.byId.get(
    (row.collisions_last_years ?? "").trim(),
  );
  const frequencyChange = cleanText(row.covid19_frequency_changes);
  const pandemicChanged = parseYesNo(supplement.pandemia);
  const extra: Record<string, unknown> = {};
  if (frequencyChange) extra.pandemic_frequency_change = frequencyChange;
  if (pandemicChanged !== null)
    extra.pandemic_changed_frequency = pandemicChanged;

  const combinationMode = opt(
    "combination mode",
    "transport_mode",
    row.transportation_integration_id,
  );

  return {
    year,
    city,
    sourceEditionId: parseInteger(row.edition_id, 0, 100_000).value,
    sourceId,
    rawDate: cleanText(row.date),
    interviewedOn: null,
    weekday: cleanText(row.weekday)?.toLowerCase() ?? null,
    pointSourceId: parseInteger(row.coordinates_id, 0, 10_000_000).value,
    area: opt("area", "area", row.area_id),
    neighborhood: cleanPlace(row.neighborhood),
    age,
    ageGroup:
      opt("age group", "age_group", row.age_category_id) ??
      (age !== null ? ageGroupFor(age) : null),
    gender: opt("gender", "gender", row.gender_id),
    schooling: opt("schooling", "schooling", row.schooling_id),
    income: opt("income", "income", row.wage_standard_id),
    colorRace: opt("color/race", "color_race", row.color_race_id),
    occupation: cleanOccupation(row.job),
    householdSize: int("household size", row.people_at_home, 1, 60),
    neighborhoodLiving: cleanPlace(row.neighborhood_living),
    daysPerWeek: int("days per week", row.week_usage_total, 0, 7),
    daysWork: int("days work", row.week_usage_working, 0, 7),
    daysSchool: int("days school", row.week_usage_school, 0, 7),
    daysShopping: int("days shopping", row.week_usage_shopping, 0, 7),
    daysLeisure: int("days leisure", row.week_usage_leisure, 0, 7),
    daysStation: int("days station", row.week_usage_station, 0, 7),
    yearsUsing: opt("years using", "years_using", row.years_using_id),
    tripMinutes,
    tripTimeGroup:
      opt(
        "trip time group",
        "trip_time_group",
        row.distance_time_category_id,
      ) ?? (tripMinutes !== null ? tripTimeGroupFor(tripMinutes) : null),
    neighborhoodOrigin: cleanPlace(row.neighborhood_origin),
    neighborhoodDestiny: cleanPlace(row.neighborhood_destiny),
    sharedBike: parseYesNo(row.shared_bicycle),
    electricBike: null,
    combinesModes: parseYesNo(supplement.combina),
    combinationMode,
    previousMode: opt(
      "previous mode",
      "transport_mode",
      row.transportation_before_bicycle_id,
    ),
    sharedBikeInfluence: parseYesNo(row.share_bike_changes),
    hadCollision: collisionRef ? parseYesNo(collisionRef.label) : null,
    hadTheft: null,
    hadHarassment: null,
    biggestIssue: opt("biggest issue", "biggest_issue", row.biggest_issue),
    biggestNeed: opt("biggest need", "biggest_need", row.biggest_need),
    motivationStart: opt(
      "motivation start",
      "motivation_start",
      row.motivation_to_start,
    ),
    motivationContinue: opt(
      "motivation continue",
      "motivation_continue",
      row.motivation_to_continue,
    ),
    covidHouseholdCase: parseYesNo(row.covid19_at_home),
    extra: Object.keys(extra).length > 0 ? extra : null,
  };
}

// ---------------------------------------------------------------------------
// 2024 wave (Recife): raw form answers, with the labels written out
// ---------------------------------------------------------------------------

const AREA_2024: Record<string, string> = {
  "1": "Área 1 - Área Central",
  "2": "Área 2 - Área Intermediária",
  "3": "Área 3 - Área Periférica",
};

// Raw 2024 answer (lowercase) -> label used by the other waves
const LABELS_2024: Record<string, Record<string, string>> = {
  schooling: {
    "ensino médio completo": "Ensino Médio",
    "ensino fundamental completo": "Ensino Fundamental",
    "ensino superior completo": "Ensino Superior",
  },
  income: {
    "até 1 salário mínimo": "até 1 salário mínimo",
    "entre 1 e 2 salários mínimos": "de 1 a 2 salários mínimos",
    "entre 2 e 5 salários mínimos": "de 2 a 5 salários mínimos",
    "acima de 5 salários mínimos": "acima de 5 salários mínimos",
    "sem rendimento": "Sem renda",
  },
  combination_mode: {
    "ônibus/metrô ou trem?": "Ônibus/Metrô/Trem/BRT",
    "a pé": "A pé ou outro modo ativo",
    "carro particular": "Carro/Moto",
    "moto particular": "Carro/Moto",
    "veículo de app": "Mototáxi/Táxi/Uber",
    outro: "Outro",
  },
  previous_mode: {
    "transporte coletivo": "Ônibus/Metrô/Trem/BRT",
    "a pé": "A pé ou outro modo ativo",
  },
  biggest_need: {
    "mais infraestrutura adequada":
      "Mais e melhores infraestruturas adequadas (ciclovias, bicicletários, sinalização etc.)",
    "mais arborização": "Mais arborização/sobreamento",
  },
};

const QUESTION_OF_LABELS_2024: Record<string, string> = {
  combination_mode: "transport_mode",
  previous_mode: "transport_mode",
};

export class OptionRegistry {
  private readonly known = new Map<string, OptionRef>();

  constructor(refs: OptionRef[]) {
    for (const r of refs) this.known.set(this.key(r.question, r.label), r);
  }

  private key(question: string, label: string): string {
    return `${question}|${label.toLowerCase()}`;
  }

  /** Canonical option for a label, ignoring case; null if the registry has never heard of it. */
  find(question: string, label: string): OptionRef | null {
    return this.known.get(this.key(question, label)) ?? null;
  }
}

export function transform2024Row(
  row: CsvRow,
  registry: OptionRegistry,
  warn: Warnings,
): InterviewDraft | null {
  const sourceId = parseInteger(row.n_quest, 0, 10_000_000).value;
  const city = cleanText(row.cidade);
  if (sourceId === null || !city) {
    warn.add("2024: row without n_quest/city (skipped)");
    return null;
  }

  const int = (
    field: string,
    value: string | undefined,
    min: number,
    max: number,
  ) => {
    const r = parseInteger(value, min, max);
    if (r.bad) warn.add(`2024: invalid ${field}`);
    return r.value;
  };
  // Free label from the form -> registered option; unknown labels are reported, never invented
  const opt = (
    question: string,
    labelKey: string,
    value: string | undefined,
  ): OptionRef | null => {
    if (isNoAnswer(value)) return null;
    const raw = (value as string).trim();
    const mapped = LABELS_2024[labelKey]?.[raw.toLowerCase()] ?? raw;
    const ref = registry.find(
      QUESTION_OF_LABELS_2024[labelKey] ?? question,
      mapped,
    );
    if (!ref) warn.add(`2024: unknown ${labelKey} "${raw}"`);
    return ref;
  };
  const yesNo = (value: string | undefined) => parseYesNo(value);

  const age = int("age", row.idade, 0, 110);
  const tripMinutes = int("trip minutes", row.tempo, 0, 1440);
  const combines = yesNo(row.combina);
  const hadPreviousMode = yesNo(row.ou_meio);

  return {
    year: 2024,
    city,
    sourceEditionId: null,
    sourceId,
    rawDate: cleanText(row.data),
    interviewedOn: null,
    weekday: cleanText(row.dia_semana)?.toLowerCase() ?? null,
    pointSourceId: null,
    area: AREA_2024[(row.zona ?? "").trim()]
      ? registry.find("area", AREA_2024[(row.zona ?? "").trim()] as string)
      : null,
    neighborhood: null,
    age,
    ageGroup: age !== null ? ageGroupFor(age) : null,
    gender: opt("gender", "gender", row.genero),
    schooling: opt("schooling", "schooling", row.escolaridade),
    income: opt("income", "income", row.renda),
    colorRace: opt("color_race", "color_race", row.raca),
    occupation: null,
    householdSize: null,
    neighborhoodLiving: null,
    daysPerWeek: int("days per week", row.qt_dia, 0, 7),
    daysWork: int("days work", row.trabalho, 0, 7),
    daysSchool: int("days school", row.escola, 0, 7),
    daysShopping: int("days shopping", row.compras, 0, 7),
    daysLeisure: int("days leisure", row.lazer, 0, 7),
    daysStation: int("days station", row.estacao, 0, 7),
    yearsUsing: opt("years_using", "years_using", row.qt_tempo),
    tripMinutes,
    tripTimeGroup: tripMinutes !== null ? tripTimeGroupFor(tripMinutes) : null,
    neighborhoodOrigin: null,
    neighborhoodDestiny: null,
    sharedBike: (row.bike ?? "").trim().toLowerCase() === "sim",
    // "NA" in the form means the bike is not electric (assumption, see survey notes)
    electricBike: (row.eletrica ?? "").trim().toLowerCase() === "sim",
    combinesModes: combines,
    combinationMode: combines
      ? opt("transport_mode", "combination_mode", row.ql_combina)
      : null,
    previousMode: hadPreviousMode
      ? opt("transport_mode", "previous_mode", row.ql_meio)
      : null,
    sharedBikeInfluence: yesNo(row.sistema),
    hadCollision: yesNo(row.ocorrencia_a),
    hadTheft: yesNo(row.ocorrencia_b),
    hadHarassment: yesNo(row.ocorrencia_c),
    biggestIssue: null,
    biggestNeed: opt("biggest_need", "biggest_need", row.oq_frequencia),
    motivationStart: null,
    motivationContinue: opt(
      "motivation_continue",
      "motivation_continue",
      row.ql_motivo,
    ),
    covidHouseholdCase: null,
    extra: null,
  };
}

// ---------------------------------------------------------------------------
// Dates, interview points, survey notes
// ---------------------------------------------------------------------------

/** Fills `interviewedOn` per survey; ambiguous dates stay NULL. Returns how many were left empty. */
export function resolveDates(drafts: InterviewDraft[]): {
  resolved: number;
  empty: number;
} {
  const bySurvey = new Map<string, InterviewDraft[]>();
  for (const d of drafts) {
    const k = `${d.year}|${d.city}`;
    const list = bySurvey.get(k) ?? [];
    list.push(d);
    bySurvey.set(k, list);
  }
  let resolved = 0;
  let empty = 0;
  for (const list of bySurvey.values()) {
    const format: DateFormat | null = inferDateFormat(
      list.flatMap((d) => (d.rawDate ? [d.rawDate] : [])),
    );
    for (const d of list) {
      d.interviewedOn = parseDate(d.rawDate, format);
      if (d.interviewedOn) resolved++;
      else empty++;
    }
  }
  return { resolved, empty };
}

export interface InterviewPoint {
  sourceId: number;
  name: string;
  latitude: string;
  longitude: string;
}

/** coordinates.csv has 30 real points followed by thousands of empty rows. */
export function parsePoints(rows: CsvRow[]): InterviewPoint[] {
  const points: InterviewPoint[] = [];
  for (const r of rows) {
    const id = parseInteger(r.id, 0, 10_000_000).value;
    const m = /^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/.exec(
      (r.point ?? "").trim(),
    );
    const name = cleanText(r.name);
    if (id === null || !m || !name) continue;
    points.push({
      sourceId: id,
      name,
      latitude: m[1] as string,
      longitude: m[2] as string,
    });
  }
  return points;
}

/** What is different about each wave, kept with the survey so the numbers are read correctly. */
export const SURVEY_NOTES: Record<number, string> = {
  2015: "Colisões: perguntava os últimos 3 anos. Coordenadas e pesquisador não informados em Recife.",
  2018: "Colisões: perguntava os últimos 3 anos. Inclui bairro de origem e destino do trajeto.",
  2021: "Colisões: perguntava os últimos 2 anos. Inclui pandemia, covid no domicílio e bicicleta compartilhada.",
  2024: "Apenas Recife. Faixas de renda diferentes (até 1, 1 a 2, 2 a 5, acima de 5 salários mínimos). Novas perguntas: bicicleta elétrica, furto e assédio (os campos eletrica 'NA' foram lidos como 'não'). Faixas de idade e de tempo de trajeto recalculadas a partir dos números, para ficarem comparáveis às outras ondas.",
};
