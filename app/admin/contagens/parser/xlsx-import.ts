import * as XLSX from "xlsx";
import type { Topology } from "~/components/Admin/topology/types";
import { emptyMovements } from "~/components/Admin/topology/types";
import type { NovaFormValues } from "~/admin/contagens/schema/nova-form";

/**
 * Parser for the Ameciclo "Dados da Contagem" xlsx template (Resumo + Dados
 * sheets). Returns a partial NovaFormValues the form layer can spread into
 * its defaults; values can be reviewed and edited before submit.
 *
 * The xlsx hourly granularity is collapsed into single totals here because
 * the form is single-bucket today. When per-bucket inputs land, swap the
 * hourly aggregation for arrays.
 */

/** xlsx label → canonical leaf key (CHARACTERISTICS in contagem-data.ts). */
const LEAF_BY_LABEL: Record<string, string> = {
  Mulher: "women",
  "Crianças e adolescentes": "juveniles",
  Capacete: "helmet",
  Calçada: "sidewalk",
  Máscara: "mascara",
  "Carona criança": "carona_crianca",
  "Carona mulher": "carona_mulher",
  "Carona homem": "carona_homem",
  "Cargueira tradicional": "cargueira_tradicional",
  "Adaptada a carga": "cargueira_adaptada",
  "Serviço APP": "servico_app",
  "Contramão para conversão": "contramao_para_conversao",
  "Bike PE": "bike_pe",
  Empurrando: "empurrando",
  Triciclo: "triciclo",
  Carroça: "carroca",
  Elétrica: "eletrica",
  Motorizada: "motorizada",
  Ciclomotor: "ciclomotor",
  "Skate e outros patináveis": "skate_patinaveis",
  Cadeirante: "cadeirante",
  Handbike: "handbike",
  "Grupos de Pedal": "grupos_pedal",
  "Faixa Azul": "faixa_azul",
};

/** Plural rollups that should never be stored as leaves. */
const ROLLUP_PLURAL_LABELS = new Set(["Caronas", "Cargueiras", "Serviços", "Contramãos"]);

export type ImportResult = {
  values: Partial<NovaFormValues>;
  warnings: string[];
};

export function parseContagemXlsx(buffer: ArrayBuffer): ImportResult {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const warnings: string[] = [];

  const out: Partial<NovaFormValues> = {};

  /* ----- Resumo: name + date ------------------------------------------- */
  const resumo = wb.Sheets["Resumo"];
  if (resumo) {
    const resumoRows = XLSX.utils.sheet_to_json<unknown[]>(resumo, {
      header: 1,
      defval: null,
      raw: true,
    });
    const resumoMap: Record<string, unknown> = {};
    for (const row of resumoRows) {
      if (Array.isArray(row) && row.length >= 2 && typeof row[0] === "string") {
        resumoMap[row[0]] = row[1];
      }
    }
    const cruzamento = String(resumoMap["Cruzamento"] ?? "").trim();
    if (cruzamento) {
      out.locationMode = "new";
      out.locationName = cruzamento;
    }
    const dateValue = resumoMap["Data"];
    if (dateValue instanceof Date) {
      const yyyy = dateValue.getUTCFullYear();
      const mm = String(dateValue.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(dateValue.getUTCDate()).padStart(2, "0");
      out.date = `${yyyy}-${mm}-${dd}`;
    }
    // Coordinates kept aside as a warning for now — the form doesn't expose
    // lat/lng inputs yet, so we just surface them so the user knows.
    const coords = String(resumoMap["Coordenadas Geográficas"] ?? "");
    const coordMatch = coords.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
    if (coordMatch) {
      warnings.push(
        `Coordenadas detectadas (${coordMatch[1]}, ${coordMatch[2]}); o formulário ainda não captura lat/lng.`,
      );
    }
  } else {
    warnings.push('Aba "Resumo" não encontrada — faltarão local e data.');
  }

  /* ----- Dados: movements + characteristics + outros ------------------- */
  const dados = wb.Sheets["Dados"];
  if (!dados) {
    warnings.push('Aba "Dados" não encontrada — sem movimentos ou características.');
    return { values: out, warnings };
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(dados, {
    header: 1,
    defval: null,
    raw: true,
  });

  /* movement table: header row contains ORIGEM and DESTINO */
  const movHeaderIdx = rows.findIndex(
    (r) => Array.isArray(r) && r.includes("ORIGEM") && r.includes("DESTINO"),
  );
  if (movHeaderIdx === -1) {
    warnings.push("Tabela de movimentos não localizada.");
  } else {
    const header = rows[movHeaderIdx] as unknown[];
    const origemCol = header.indexOf("ORIGEM");
    const destinoCol = header.indexOf("DESTINO");
    const totalCol = header.indexOf("TOTAL");

    const movRows: { origem: string; destino: string; total: number }[] = [];
    for (let i = movHeaderIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) break;
      const origem = row[origemCol];
      const destino = row[destinoCol];
      if (typeof origem !== "string" || typeof destino !== "string") break;
      const total =
        totalCol >= 0 && row[totalCol] != null
          ? Number(row[totalCol])
          : sumNumeric(row, destinoCol + 1, totalCol >= 0 ? totalCol : row.length);
      movRows.push({
        origem: origem.trim(),
        destino: destino.trim(),
        total: Number.isFinite(total) ? total : 0,
      });
    }

    // Approach order = order of first appearance in ORIGEM column, then any
    // DESTINO that didn't appear as origem (covers point-style sessions).
    const approachLabels: string[] = [];
    for (const m of movRows) if (!approachLabels.includes(m.origem)) approachLabels.push(m.origem);
    for (const m of movRows) if (!approachLabels.includes(m.destino)) approachLabels.push(m.destino);

    out.approaches = approachLabels;
    out.topology =
      approachLabels.length === 2
        ? "point"
        : approachLabels.length === 3
        ? "t_junction"
        : approachLabels.length === 4
        ? "crossroad"
        : ((): Topology => {
            warnings.push(
              `Número inesperado de aproximações (${approachLabels.length}); usando "crossroad".`,
            );
            return "crossroad";
          })();

    const movements = emptyMovements(approachLabels.length);
    for (const m of movRows) {
      const i = approachLabels.indexOf(m.origem);
      const j = approachLabels.indexOf(m.destino);
      if (i >= 0 && j >= 0 && i !== j) {
        movements[`${i}-${j}`] = m.total > 0 ? String(m.total) : "";
      }
    }
    out.movements = movements;
  }

  /* characteristic tables: every header row containing "Característica" */
  const charHeaderIdxs: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (Array.isArray(row) && row.includes("Característica")) charHeaderIdxs.push(i);
  }

  const characteristics: Record<string, number> = {};
  const outros: { label: string; count: number }[] = [];

  for (let s = 0; s < charHeaderIdxs.length; s++) {
    const headerIdx = charHeaderIdxs[s];
    const header = rows[headerIdx] as unknown[];
    const labelCol = header.indexOf("Característica");
    const totalC = header.indexOf("TOTAL");

    type Row = { label: string; total: number };
    const sectionRows: Row[] = [];
    const sectionEnd = charHeaderIdxs[s + 1] ?? rows.length;
    for (let i = headerIdx + 1; i < sectionEnd; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const label = row[labelCol];
      if (typeof label !== "string") continue;
      // Section divider rows ("Dados qualitativos ...") have no totals.
      if (label.startsWith("Dados qualitativos")) continue;
      const total =
        totalC >= 0 && row[totalC] != null
          ? Number(row[totalC])
          : sumNumeric(row, labelCol + 1, totalC >= 0 ? totalC : row.length);
      sectionRows.push({ label: label.trim(), total: Number.isFinite(total) ? total : 0 });
    }

    // Decide whether ambiguous singulars ("Serviço", "Contramão") in this
    // section are leaves or rollups: leaves only if their qualified sibling
    // (Serviço APP / Contramão para conversão) is also in this section.
    const labels = new Set(sectionRows.map((r) => r.label));
    const servicoIsLeaf = labels.has("Serviço APP");
    const contramaoIsLeaf = labels.has("Contramão para conversão");

    for (const { label, total } of sectionRows) {
      if (ROLLUP_PLURAL_LABELS.has(label)) continue;

      if (label === "Serviço") {
        if (servicoIsLeaf && total > 0) characteristics["servico"] = total;
        continue;
      }
      if (label === "Contramão") {
        if (contramaoIsLeaf && total > 0) characteristics["contramao"] = total;
        continue;
      }

      // "Outros" with optional " - <descrição>" suffix → ad-hoc row
      if (/^"?Outros"?\s*(-\s*.+)?$/.test(label)) {
        const desc = label.replace(/^"?Outros"?\s*-?\s*/, "").trim();
        if (total > 0 && desc.length > 0) {
          outros.push({ label: desc, count: total });
        }
        continue;
      }

      const key = LEAF_BY_LABEL[label];
      if (!key) {
        if (total > 0) {
          warnings.push(`Característica não mapeada: "${label}" (total: ${total}).`);
        }
        continue;
      }
      if (total > 0) characteristics[key] = total;
    }
  }

  const characteristicsForForm: Record<string, string> = {};
  for (const [k, v] of Object.entries(characteristics)) {
    characteristicsForForm[k] = v > 0 ? String(v) : "";
  }
  out.characteristics = characteristicsForForm;
  out.outros = outros.map((o) => ({ label: o.label, count: String(o.count) }));

  // The xlsx template runs 06h–19h (14 hourly buckets). Use those as defaults.
  out.startTime ??= "06:00";
  out.endTime ??= "20:00";

  return { values: out, warnings };
}

function sumNumeric(row: unknown[], from: number, to: number): number {
  let s = 0;
  for (let c = from; c < to; c++) {
    const v = Number(row[c]);
    if (Number.isFinite(v)) s += v;
  }
  return s;
}
