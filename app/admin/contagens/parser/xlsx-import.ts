import * as XLSX from "xlsx";
import type { Topology } from "~/components/Admin/topology/types";
import type {
  BucketMinutes,
  NovaFormValues,
} from "~/admin/contagens/schema/nova-form";

/**
 * Parser for the Ameciclo "Dados da Contagem" xlsx template (Resumo + Dados
 * sheets). Returns a partial NovaFormValues the form layer can spread into
 * its defaults; values can be reviewed and edited before submit.
 *
 * Per-bucket fidelity: every hourly column becomes one entry in the value
 * array (movements, characteristics, outros[].counts). The form switches to
 * "Por hora" automatically when imported data is per-bucket.
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

  /* ----- detect hourly column geometry from movement table header ------ */
  const movHeaderIdx = rows.findIndex(
    (r) => Array.isArray(r) && r.includes("ORIGEM") && r.includes("DESTINO"),
  );

  let bucketCount = 0;
  let bucketMinutes: BucketMinutes = "60";
  let startHour = 6;

  if (movHeaderIdx >= 0) {
    const header = rows[movHeaderIdx] as unknown[];
    const totalCol = header.indexOf("TOTAL");
    const destinoCol = header.indexOf("DESTINO");
    const hourlyHeaders: { col: number; hour: number }[] = [];
    for (let c = destinoCol + 1; c < (totalCol >= 0 ? totalCol : header.length); c++) {
      const v = header[c];
      if (typeof v === "number" && Number.isFinite(v)) {
        hourlyHeaders.push({ col: c, hour: v });
      }
    }
    if (hourlyHeaders.length > 0) {
      bucketCount = hourlyHeaders.length;
      startHour = hourlyHeaders[0].hour;
      if (hourlyHeaders.length >= 2) {
        const diffMin = Math.round((hourlyHeaders[1].hour - hourlyHeaders[0].hour) * 60);
        if (diffMin === 15 || diffMin === 30 || diffMin === 60 || diffMin === 120) {
          bucketMinutes = String(diffMin) as BucketMinutes;
        } else {
          warnings.push(
            `Largura de bucket atípica (${diffMin}min); usando 60 min como fallback.`,
          );
        }
      }
      const widthMin = Number(bucketMinutes);
      const startMin = startHour * 60;
      const endMin = startMin + bucketCount * widthMin;
      out.bucketMinutes = bucketMinutes;
      out.startTime = formatHHMM(startMin);
      out.endTime = formatHHMM(endMin);
    }
  }

  if (bucketCount === 0) {
    warnings.push("Não foi possível detectar a granularidade horária; usando 1 bucket.");
    bucketCount = 1;
  }

  /* ----- movement table ------------------------------------------------- */
  if (movHeaderIdx === -1) {
    warnings.push("Tabela de movimentos não localizada.");
  } else {
    const header = rows[movHeaderIdx] as unknown[];
    const origemCol = header.indexOf("ORIGEM");
    const destinoCol = header.indexOf("DESTINO");
    const totalCol = header.indexOf("TOTAL");

    type MovRow = { origem: string; destino: string; buckets: string[] };
    const movRows: MovRow[] = [];
    for (let i = movHeaderIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) break;
      const origem = row[origemCol];
      const destino = row[destinoCol];
      if (typeof origem !== "string" || typeof destino !== "string") break;

      const buckets: string[] = [];
      const last = totalCol >= 0 ? totalCol : row.length;
      for (let c = destinoCol + 1; c < last; c++) {
        const n = Number(row[c]);
        buckets.push(Number.isFinite(n) && n > 0 ? String(Math.trunc(n)) : "");
      }
      // Truncate / pad to bucketCount in case the row is misaligned.
      while (buckets.length < bucketCount) buckets.push("");
      buckets.length = bucketCount;

      movRows.push({ origem: origem.trim(), destino: destino.trim(), buckets });
    }

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

    const movements: Record<string, string[]> = {};
    for (let i = 0; i < approachLabels.length; i++) {
      for (let j = 0; j < approachLabels.length; j++) {
        if (i !== j) movements[`${i}-${j}`] = Array.from({ length: bucketCount }, () => "");
      }
    }
    for (const m of movRows) {
      const i = approachLabels.indexOf(m.origem);
      const j = approachLabels.indexOf(m.destino);
      if (i >= 0 && j >= 0 && i !== j) {
        movements[`${i}-${j}`] = m.buckets;
      }
    }
    out.movements = movements;
  }

  /* ----- characteristic tables ----------------------------------------- */
  const charHeaderIdxs: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (Array.isArray(row) && row.includes("Característica")) charHeaderIdxs.push(i);
  }

  const characteristics: Record<string, string[]> = {};
  const outros: { label: string; counts: string[] }[] = [];

  for (let s = 0; s < charHeaderIdxs.length; s++) {
    const headerIdx = charHeaderIdxs[s];
    const header = rows[headerIdx] as unknown[];
    const labelCol = header.indexOf("Característica");
    const totalC = header.indexOf("TOTAL");

    type SectionRow = { label: string; total: number; buckets: string[] };
    const sectionRows: SectionRow[] = [];
    const sectionEnd = charHeaderIdxs[s + 1] ?? rows.length;
    for (let i = headerIdx + 1; i < sectionEnd; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const label = row[labelCol];
      if (typeof label !== "string") continue;
      if (label.startsWith("Dados qualitativos")) continue;

      const buckets: string[] = [];
      const last = totalC >= 0 ? totalC : row.length;
      for (let c = labelCol + 1; c < last; c++) {
        const n = Number(row[c]);
        buckets.push(Number.isFinite(n) && n > 0 ? String(Math.trunc(n)) : "");
      }
      while (buckets.length < bucketCount) buckets.push("");
      buckets.length = bucketCount;

      const total =
        totalC >= 0 && row[totalC] != null
          ? Number(row[totalC])
          : buckets.reduce((acc, x) => acc + (Number(x) || 0), 0);
      sectionRows.push({ label: label.trim(), total: Number.isFinite(total) ? total : 0, buckets });
    }

    const labels = new Set(sectionRows.map((r) => r.label));
    const servicoIsLeaf = labels.has("Serviço APP");
    const contramaoIsLeaf = labels.has("Contramão para conversão");

    for (const { label, total, buckets } of sectionRows) {
      if (ROLLUP_PLURAL_LABELS.has(label)) continue;

      if (label === "Serviço") {
        if (servicoIsLeaf && total > 0) characteristics["servico"] = buckets;
        continue;
      }
      if (label === "Contramão") {
        if (contramaoIsLeaf && total > 0) characteristics["contramao"] = buckets;
        continue;
      }

      if (/^"?Outros"?\s*(-\s*.+)?$/.test(label)) {
        const desc = label.replace(/^"?Outros"?\s*-?\s*/, "").trim();
        if (total > 0 && desc.length > 0) {
          outros.push({ label: desc, counts: buckets });
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
      if (total > 0) characteristics[key] = buckets;
    }
  }

  out.characteristics = characteristics;
  out.outros = outros.map((o) => ({ label: o.label, counts: o.counts }));

  return { values: out, warnings };
}

function formatHHMM(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${h}:${mm}`;
}
