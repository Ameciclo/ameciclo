import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import {
  buildCatalog,
  type Catalog,
  type CsvRow,
  type InterviewDraft,
  type InterviewPoint,
  OPTIONS_ONLY_IN_2024,
  OptionRegistry,
  parsePoints,
  resolveDates,
  supplementFrom,
  transform2024Row,
  transformLegacyRow,
  Warnings,
} from "./transform";

/** CSV exports of the research spreadsheets, expected inside the import directory. */
export const SURVEY_FILES = {
  categories: "categories.csv", // "Plataforma de dados", tab categories
  toDb: "to_db.csv", // tab to_db (2015, 2018, 2021; every city)
  standardized: "dados_trabalhados.csv", // tab "Dados trabalhados e padronizados"
  coordinates: "coordinates.csv", // tab coordinates (interview points, Recife)
  raw2024: "u2024_aba2024.csv", // "Relatório unificado ... 2024 - RECIFE", tab 2024
} as const;

export interface SurveyDataset {
  catalog: Catalog;
  drafts: InterviewDraft[];
  points: InterviewPoint[];
  warnings: Warnings;
  dates: { resolved: number; empty: number };
}

export function readCsv(path: string): CsvRow[] {
  return parse(readFileSync(path, "utf8"), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: false,
  }) as CsvRow[];
}

export function loadSurveyDataset(dir: string): SurveyDataset {
  const file = (name: string) => join(dir, name);
  const catalog = buildCatalog(readCsv(file(SURVEY_FILES.categories)));
  const toDb = readCsv(file(SURVEY_FILES.toDb));
  const standardized = readCsv(file(SURVEY_FILES.standardized));
  const raw2024 = readCsv(file(SURVEY_FILES.raw2024));
  const points = parsePoints(readCsv(file(SURVEY_FILES.coordinates)));

  if (toDb.length !== standardized.length) {
    throw new Error(
      `to_db has ${toDb.length} rows but the standardized sheet has ${standardized.length}; they must match`,
    );
  }

  const warnings = new Warnings();
  const drafts: InterviewDraft[] = [];

  toDb.forEach((row, i) => {
    const draft = transformLegacyRow(
      row,
      supplementFrom(standardized[i] as CsvRow),
      catalog,
      warnings,
    );
    if (draft) drafts.push(draft);
  });

  const registry = new OptionRegistry([
    ...catalog.options,
    ...OPTIONS_ONLY_IN_2024,
  ]);
  for (const row of raw2024) {
    const draft = transform2024Row(row, registry, warnings);
    if (draft) drafts.push(draft);
  }

  const seen = new Set<string>();
  for (const d of drafts) {
    const key = `${d.year}|${d.city}|${d.sourceId}`;
    if (seen.has(key)) {
      throw new Error(
        `Duplicate interview ${key}: the unique key (survey, source id) would collide`,
      );
    }
    seen.add(key);
  }

  return { catalog, drafts, points, warnings, dates: resolveDates(drafts) };
}
