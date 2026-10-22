import ExcelJS from "exceljs";

import { isHttpUrl, type Position } from "../shared";
import { type Block, normalizeLabel, resolveCharacteristic } from "./characteristics";

export const PARSER_VERSION = "1";

type Cell = string | number | Date | null;
type Grid = Cell[][];

export type Basis = "observed" | "projected";
export type Severity = "info" | "warning" | "error";

export type ParsedWarning = { severity: Severity; code: string; message: string; ref?: string };

export type ParsedMovement = {
  from: number;
  to: number;
  bucket: number | null;
  value: number;
  basis: Basis;
};

export type ParsedObservation = {
  basis: Basis;
  block: Block;
  position: number;
  rawLabel: string;
  characteristicKey: string | null;
  bucket: number | null;
  value: number;
};

export type ParsedCondition = {
  bucket: number;
  kind: string;
  value: number | null;
  note: string | null;
};

export type ParsedNote = { text: string; bucketFrom: number | null; bucketTo: number | null };

export type ParsedContagem = {
  name: string;
  variant: string | null;
  date: string | null;
  latitude: number | null;
  longitude: number | null;
  reportUrl: string | null;
  approaches: string[];
  positions: Position[] | null;
  topology: "point" | "t_junction" | "crossroad";
  bucketMinutes: number;
  startHour: number;
  bucketCount: number;
  observedBuckets: number[] | null;
  isProjected: boolean;
  movements: ParsedMovement[];
  observations: ParsedObservation[];
  conditions: ParsedCondition[];
  notes: ParsedNote[];
  warnings: ParsedWarning[];
  layout: string;
  sheetNames: string[];
  resumoTotal: number | null;
  resumoPeak: number | null;
  totalCyclists: number;
  peakBucketCount: number;
};

function plain(v: ExcelJS.CellValue): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v.trim() === "" ? null : v;
  if (typeof v === "number" || v instanceof Date) return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if ("result" in v) return v.result === undefined ? null : plain(v.result);
  if ("richText" in v) return plain(v.richText.map((t) => t.text).join(""));
  if ("text" in v) return plain(String(v.text));
  return null;
}

function readGrid(ws: ExcelJS.Worksheet): Grid {
  const grid: Grid = [];
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const cells: Cell[] = [];
    for (let c = 1; c <= Math.max(ws.columnCount, 1); c++) cells.push(plain(row.getCell(c).value));
    grid.push(cells);
  }
  return grid;
}

const str = (c: Cell | undefined): string => (typeof c === "string" ? c.trim() : "");
const isBlank = (c: Cell | undefined): boolean => c === null || c === undefined || c === "";

function num(c: Cell | undefined): number | null {
  if (typeof c === "number" && Number.isFinite(c)) return c;
  if (typeof c === "string") {
    const n = Number(c.replace(",", "."));
    return c.trim() !== "" && Number.isFinite(n) ? n : null;
  }
  return null;
}

function excelSerialToIso(serial: number): string {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000);
  return d.toISOString().slice(0, 10);
}

function parseDate(c: Cell | undefined): string | null {
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  if (typeof c === "number") return excelSerialToIso(c);
  if (typeof c === "string") {
    const m = c.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const iso = c.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[0];
  }
  return null;
}

type MovementTable = {
  headerRow: number;
  originCol: number;
  destCol: number;
  hourCols: number[];
  hours: number[];
  totalCol: number;
  firstDataRow: number;
  rows: { from: string; to: string; values: number[] }[];
  placeholderRows: number;
  endRow: number;
};

function parseHour(c: Cell | undefined): number | null {
  if (typeof c === "number" && Number.isFinite(c)) return c;
  if (typeof c === "string") {
    const m = c.trim().match(/^(\d{1,2})\s*h?/i);
    if (m) return Number(m[1]);
  }
  return null;
}

function findMovementTable(grid: Grid): MovementTable | null {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    const originCol = row.findIndex((c) => normalizeLabel(str(c)) === "origem");
    if (originCol < 0 || normalizeLabel(str(row[originCol + 1])) !== "destino") continue;

    const hourCols: number[] = [];
    const hours: number[] = [];
    let c = originCol + 2;
    for (; c < row.length; c++) {
      const h = parseHour(row[c]);
      if (h === null) break;
      hourCols.push(c);
      hours.push(h);
    }
    const totalCol = row.findIndex((x) => normalizeLabel(str(x)) === "total");

    const rows: MovementTable["rows"] = [];
    let placeholderRows = 0;
    let end = r + 1;
    for (; end < grid.length; end++) {
      const g = grid[end];
      const from = str(g[originCol]);
      const to = str(g[originCol + 1]);
      const marker = normalizeLabel(from) || normalizeLabel(to);
      if (/^(total|percentual)/.test(marker)) break;
      if (/dados qualitativos/.test(g.map((x) => normalizeLabel(str(x))).join(" "))) break;
      if (!from && !to) {
        if (rows.length + placeholderRows >= 12) break;
        continue;
      }
      if (!from || !to) {
        placeholderRows++;
        continue;
      }
      rows.push({ from, to, values: hourCols.map((hc) => num(g[hc]) ?? 0) });
    }
    return {
      headerRow: r,
      originCol,
      destCol: originCol + 1,
      hourCols,
      hours,
      totalCol,
      firstDataRow: r + 1,
      rows,
      placeholderRows,
      endRow: end,
    };
  }
  return null;
}

type QualRow = {
  block: Block;
  label: string;
  values: Cell[];
  total: number | null;
};

function parseQualitative(grid: Grid, table: MovementTable): QualRow[] {
  const labelCol = table.hourCols[0] - 1;
  const out: QualRow[] = [];
  let block: Block | null = null;
  for (let r = table.endRow; r < grid.length; r++) {
    const g = grid[r];
    const joined = g.map((x) => normalizeLabel(str(x))).join(" ");
    if (/dados qualitativos padr/.test(joined)) {
      block = "padroes";
      continue;
    }
    if (/dados qualitativos das observ/.test(joined)) {
      block = "observacoes";
      continue;
    }
    if (!block) continue;
    const label = str(g[labelCol]);
    if (!label) continue;
    const n = normalizeLabel(label);
    if (/^(caracteristica|total|percentual)/.test(n)) continue;
    out.push({
      block,
      label,
      values: table.hourCols.map((hc) => g[hc] ?? null),
      total: table.totalCol >= 0 ? num(g[table.totalCol]) : null,
    });
  }
  return out;
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

// Merges labels that differ by one character ("Cento" vs "Centro"), keeping the
// most frequent spelling. Returns the corrections for a warning.
function mergeApproachTypos(rows: { from: string; to: string }[]): Map<string, string> {
  const freq = new Map<string, number>();
  for (const r of rows) for (const l of [r.from, r.to]) freq.set(l, (freq.get(l) ?? 0) + 1);
  const labels = [...freq.keys()].sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0));
  const fixes = new Map<string, string>();
  const plainLabel = (l: string) =>
    l.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
  // A real approach shows up in many matrix rows; a typo shows up in one or two.
  for (const wrong of labels) {
    if ((freq.get(wrong) ?? 0) > 2 || plainLabel(wrong).length < 4) continue;
    const right = labels.find(
      (l) => l !== wrong && (freq.get(l) ?? 0) >= 4 && editDistanceAtMostOne(plainLabel(l), plainLabel(wrong)),
    );
    if (right) fixes.set(wrong, right);
  }
  for (const r of rows) {
    r.from = fixes.get(r.from) ?? r.from;
    r.to = fixes.get(r.to) ?? r.to;
  }
  return fixes;
}

function approachesOf(rows: { from: string; to: string }[]): string[] {
  const out: string[] = [];
  for (const r of rows) if (!out.includes(r.from)) out.push(r.from);
  for (const r of rows) if (!out.includes(r.to)) out.push(r.to);
  return out;
}

// A link cell shows a title but keeps the address in `hyperlink`; plain() only
// keeps the title, so the report cell is read separately.
function reportCell(ws: ExcelJS.Worksheet | undefined): { text: string; url: string | null } {
  if (!ws) return { text: "", url: null };
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    if (normalizeLabel(str(plain(row.getCell(1).value))) !== "relatorio") continue;
    const value = row.getCell(2).value;
    const hyperlink = value !== null && typeof value === "object" && "hyperlink" in value ? value.hyperlink : null;
    const text = str(plain(value)).replace(/^["'\u201c\u2018]+|["'\u201d\u2019]+$/g, "").trim();
    const url = [hyperlink, text].find((c): c is string => typeof c === "string" && isHttpUrl(c.trim()));
    return { text, url: url?.trim() ?? null };
  }
  return { text: "", url: null };
}

function parseResumo(ws: ExcelJS.Worksheet | undefined) {
  const map = new Map<string, Cell>();
  if (ws) {
    for (const row of readGrid(ws)) {
      const label = normalizeLabel(str(row[0]));
      if (label && !map.has(label)) map.set(label, row[1] ?? null);
    }
  }
  const report = reportCell(ws);
  const coords = str(map.get("coordenadas geograficas") ?? null).match(
    /(-?\d+[.,]\d+)\s*[,;]\s*(-?\d+[.,]\d+)/,
  );
  return {
    name: str(map.get("cruzamento") ?? null),
    date: parseDate(map.get("data")),
    latitude: coords ? Number(coords[1].replace(",", ".")) : null,
    longitude: coords ? Number(coords[2].replace(",", ".")) : null,
    reportUrl: report.url,
    reportText: report.text,
    total: num(map.get("total")),
    peak: num(map.get("maximo em um hora")),
  };
}

// The Fluxo sheet is a sketch of the intersection with each approach name written
// on its side. The side of the whole sketch an approach sits on gives its position.
function inferPositions(grid: Grid, approaches: string[]): Position[] | null {
  if (approaches.length < 2 || approaches.length > 4) return null;
  const key = (text: string) => normalizeLabel(text).replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

  const centers = approaches.map((name) => {
    const wanted = key(name);
    const hits: { r: number; c: number }[] = [];
    grid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (typeof cell === "string" && key(cell) === wanted) hits.push({ r, c });
      }),
    );
    if (hits.length === 0) return null;
    return {
      r: hits.reduce((s, h) => s + h.r, 0) / hits.length,
      c: hits.reduce((s, h) => s + h.c, 0) / hits.length,
    };
  });
  if (centers.some((c) => c === null)) return null;
  const found = centers.flatMap((c) => (c ? [c] : []));

  const meanR = found.reduce((s, c) => s + c.r, 0) / found.length;
  const meanC = found.reduce((s, c) => s + c.c, 0) / found.length;
  const positions = found.map((c): Position => {
    const dy = c.r - meanR;
    const dx = c.c - meanC;
    if (Math.abs(dy) > Math.abs(dx)) return dy < 0 ? "N" : "S";
    return dx < 0 ? "W" : "E";
  });
  return new Set(positions).size === positions.length ? positions : null;
}

function topologyOf(n: number): ParsedContagem["topology"] {
  if (n <= 2) return "point";
  if (n === 3) return "t_junction";
  return "crossroad";
}

export async function parseWorkbook(
  source: Uint8Array | ArrayBuffer,
  options: { aliases?: Record<string, string> } = {},
): Promise<ParsedContagem> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(source instanceof ArrayBuffer ? source : Uint8Array.from(source).buffer);
  const warnings: ParsedWarning[] = [];
  const warn = (severity: Severity, code: string, message: string, ref?: string) =>
    warnings.push({ severity, code, message, ref });

  const sheetNames = wb.worksheets.map((w) => w.name);
  const resumo = parseResumo(wb.getWorksheet("Resumo"));
  if (!resumo.name) warn("error", "missing_name", "Resumo has no Cruzamento");
  if (!resumo.date) warn("error", "missing_date", "Resumo has no readable Data");
  if (resumo.latitude === null) warn("warning", "missing_coordinates", "No coordinates in Resumo");
  if (resumo.reportText && !resumo.reportUrl) {
    warn("warning", "report_link_invalid", `The report cell says "${resumo.reportText}" but has no web address`);
  }

  const dadosSheet = wb.getWorksheet("Dados");
  const grid = dadosSheet ? readGrid(dadosSheet) : [];
  const table = findMovementTable(grid);
  if (!table || table.rows.length === 0) {
    warn("error", "no_movements", "Could not find the movement matrix in Dados");
    return {
      name: resumo.name,
      variant: null,
      date: resumo.date,
      latitude: resumo.latitude,
      longitude: resumo.longitude,
      reportUrl: resumo.reportUrl,
      approaches: [],
      positions: null,
      topology: "crossroad",
      bucketMinutes: 60,
      startHour: 6,
      bucketCount: 0,
      observedBuckets: null,
      isProjected: false,
      movements: [],
      observations: [],
      conditions: [],
      notes: [],
      warnings,
      layout: "unknown",
      sheetNames,
      resumoTotal: resumo.total,
      resumoPeak: resumo.peak,
      totalCyclists: 0,
      peakBucketCount: 0,
    };
  }

  const typoFixes = mergeApproachTypos(table.rows);
  for (const [wrong, right] of typoFixes) {
    warn("info", "approach_typo", `Approach "${wrong}" merged into "${right}"`);
  }
  const approaches = approachesOf(table.rows);
  const fluxo = wb.getWorksheet("Fluxo");
  const approachPositions = fluxo ? inferPositions(readGrid(fluxo), approaches) : null;
  if (approaches.length > 4) {
    warn("warning", "many_approaches", `${approaches.length} approaches found; stored as crossroad`);
  }
  if (table.placeholderRows > 0) {
    warn("info", "placeholder_rows", `${table.placeholderRows} matrix rows without a destination were skipped`);
  }
  const expected = approaches.length * (approaches.length - 1);
  if (table.rows.length !== expected) {
    warn("warning", "movements_incomplete", `${table.rows.length} movements found, ${expected} expected for ${approaches.length} approaches`);
  }

  const bucketMinutes =
    table.hours.length > 1 ? Math.round((table.hours[1] - table.hours[0]) * 60) || 60 : 60;
  const origSheet = wb.getWorksheet("Original");
  const origTable = origSheet ? findMovementTable(readGrid(origSheet)) : null;
  // The Original (observed) sheet can cover hours the projected Dados sheet does not.
  const allHours = [...table.hours, ...(origTable?.hours ?? [])];
  const startHour = Math.min(...allHours);
  const lastHour = Math.max(...allHours);
  const bucketCount = Math.round(((lastHour - startHour) * 60) / bucketMinutes) + 1;
  const bucketOf = (hour: number) => Math.round(((hour - startHour) * 60) / bucketMinutes);
  if (table.hours.some((h, i) => i > 0 && h - table.hours[i - 1] !== 1)) {
    warn("warning", "irregular_hours", `Hour columns are not consecutive: ${table.hours.join(",")}`);
  }

  const hasOriginal = Boolean(origSheet);
  const dadosBasis: Basis = hasOriginal ? "projected" : "observed";
  const movements: ParsedMovement[] = [];
  const idx = (label: string) => approaches.indexOf(label);

  for (const row of table.rows) {
    row.values.forEach((value, i) => {
      movements.push({ from: idx(row.from), to: idx(row.to), bucket: bucketOf(table.hours[i]), value, basis: dadosBasis });
    });
  }

  let observedBuckets: number[] | null = null;
  if (hasOriginal) {
    if (origTable && origTable.rows.length > 0) {
      mergeApproachTypos(origTable.rows);
      const seen = new Set<number>();
      for (const row of origTable.rows) {
        const from = idx(row.from);
        const to = idx(row.to);
        if (from < 0 || to < 0) {
          warn("warning", "original_unknown_approach", `Original sheet uses unknown approach ${row.from} -> ${row.to}`);
          continue;
        }
        row.values.forEach((value, i) => {
          const bucket = bucketOf(origTable.hours[i]);
          if (value > 0) seen.add(bucket);
          movements.push({ from, to, bucket, value, basis: "observed" });
        });
      }
      observedBuckets = [...seen].sort((a, b) => a - b);
    } else {
      warn("warning", "original_unreadable", "Sheet Original exists but its movement matrix could not be read");
    }
    warn("info", "projected", "Dados holds projected values; observed values come from sheet Original");
  }

  const merged = new Map<string, ParsedMovement>();
  let duplicates = 0;
  for (const m of movements) {
    const key = `${m.basis}|${m.from}|${m.to}|${m.bucket}`;
    const existing = merged.get(key);
    if (existing) {
      existing.value += m.value;
      duplicates++;
    } else merged.set(key, { ...m });
  }
  if (duplicates > 0) {
    warn("warning", "duplicate_movements", `${duplicates} movement cells repeated an approach pair and were summed`);
    movements.splice(0, movements.length, ...merged.values());
  }

  const qual = parseQualitative(grid, table);
  const padroesLabels = qual.filter((q) => q.block === "padroes").map((q) => normalizeLabel(q.label));
  const detailInPadroes =
    padroesLabels.includes("carona mulher") && padroesLabels.includes("carona homem");
  const layout = detailInPadroes ? "detail-in-padroes" : "rollup-in-padroes";

  const observations: ParsedObservation[] = [];
  const conditions: ParsedCondition[] = [];
  const notes: ParsedNote[] = [];
  const unmapped = new Set<string>();
  const positions: Record<Block, number> = { padroes: 0, observacoes: 0 };

  for (const row of qual) {
    const n = normalizeLabel(row.label);
    if (n.startsWith("obs")) {
      notes.push({ text: row.label, bucketFrom: null, bucketTo: null });
      continue;
    }
    if (n.startsWith("chuv")) {
      row.values.forEach((v, bucket) => {
        if (isBlank(v)) return;
        const value = num(v);
        if (value === 0) return;
        conditions.push({ bucket, kind: "rain", value, note: typeof v === "string" && value === null ? v : null });
      });
      continue;
    }

    const position = positions[row.block]++;
    const key = resolveCharacteristic(row.label, row.block, detailInPadroes, options.aliases);
    if (!key) unmapped.add(row.label);

    let stored = 0;
    row.values.forEach((v, i) => {
      const bucket = bucketOf(table.hours[i]);
      if (isBlank(v)) return;
      const value = num(v);
      if (value === null) {
        notes.push({ text: `${row.label}: ${String(v)}`, bucketFrom: bucket, bucketTo: bucket });
        return;
      }
      if (!Number.isInteger(value)) {
        warn("info", "non_integer_value", `${row.label} hour ${table.hours[i]} has value ${value}; rounded`, row.label);
      }
      const rounded = Math.round(value);
      if (rounded === 0) return;
      observations.push({ basis: "observed", block: row.block, position, rawLabel: row.label, characteristicKey: key, bucket, value: rounded });
      stored++;
    });
    if (stored === 0) {
      observations.push({ basis: "observed", block: row.block, position, rawLabel: row.label, characteristicKey: key, bucket: null, value: Math.round(row.total ?? 0) });
    }
  }
  for (const label of unmapped) {
    warn("warning", "unmapped_label", `Characteristic "${label}" has no canonical mapping`, label);
  }

  const bucketTotals = Array.from<number>({ length: bucketCount }).fill(0);
  let totalCyclists = 0;
  for (const m of movements) {
    if (m.basis !== dadosBasis || m.bucket === null) continue;
    bucketTotals[m.bucket] += m.value;
    totalCyclists += m.value;
  }
  const peakBucketCount = Math.max(0, ...bucketTotals);

  // Peak-hour counts leave the other hours empty. Without an Original sheet they
  // are not projected, so record which hours were actually counted.
  const emptyBuckets = bucketTotals.flatMap((v, i) => (v === 0 ? [i] : []));
  if (!hasOriginal && emptyBuckets.length >= 2 && emptyBuckets.length < bucketCount) {
    observedBuckets = bucketTotals.flatMap((v, i) => (v > 0 ? [i] : []));
    const counted = observedBuckets.map((b) => `${startHour + (b * bucketMinutes) / 60}h`).join(", ");
    warn(
      "warning",
      "partial_day",
      `Only ${counted} have counts; ${emptyBuckets.length} of ${bucketCount} hours are empty (peak-hour count?)`,
    );
  }

  if (resumo.total !== null && resumo.total !== totalCyclists) {
    warn("warning", "total_mismatch", `Resumo total ${resumo.total} differs from the movement sum ${totalCyclists}`);
  }
  if (resumo.peak !== null && resumo.peak !== peakBucketCount) {
    warn("info", "peak_mismatch", `Resumo peak ${resumo.peak} differs from the computed peak ${peakBucketCount}`);
  }

  const sumKey = (key: string) =>
    observations
      .filter((o) => o.characteristicKey === key && o.basis === "observed")
      .reduce((s, o) => s + o.value, 0);
  const groups: Record<string, string[]> = {
    caronas: ["carona_crianca", "carona_mulher", "carona_homem"],
    cargueiras: ["cargueira_tradicional", "cargueira_adaptada"],
    servicos: ["servico", "servico_app"],
    contramaos: ["contramao", "contramao_conversao"],
  };
  for (const [parent, leaves] of Object.entries(groups)) {
    const p = sumKey(parent);
    const l = leaves.reduce((s, k) => s + sumKey(k), 0);
    const hasLeafRows = observations.some((o) => o.characteristicKey !== null && leaves.includes(o.characteristicKey));
    if (p > 0 && l === 0 && hasLeafRows) {
      warn("info", "rollup_without_parts", `${parent} is ${p} but its nested rows are all zero`, parent);
    } else if (p > 0 && l > 0 && p !== l) {
      const apart = Math.abs(p - l) / Math.max(p, l);
      warn(
        apart > 0.25 ? "warning" : "info",
        "rollup_mismatch",
        `${parent} is ${p} but its parts add up to ${l} (${Math.round(apart * 100)}% apart)`,
        parent,
      );
    }
  }

  return {
    name: resumo.name,
    variant: null,
    date: resumo.date,
    latitude: resumo.latitude,
    longitude: resumo.longitude,
    reportUrl: resumo.reportUrl,
    approaches,
    positions: approachPositions,
    topology: topologyOf(approaches.length),
    bucketMinutes,
    startHour,
    bucketCount,
    observedBuckets,
    isProjected: hasOriginal,
    movements,
    observations,
    conditions,
    notes,
    warnings,
    layout,
    sheetNames,
    resumoTotal: resumo.total,
    resumoPeak: resumo.peak,
    totalCyclists,
    peakBucketCount,
  };
}
