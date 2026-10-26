import { z } from "zod";
import { getScoreBreakdown } from "./assessment";
import type { CityDto, FormDto, SegmentDto } from "./domain";
import { type CriterionCode, type IdecicloRating, PartialFormDataSchema } from "./form-types";

// The city's results screen: every segment with its score, the three networks
// (GAM and weight) and the preview of the city's IDECICLO. Weights here are the
// ones the results screen has always used.

export const NETWORK_CONFIG = {
  estrutural: { label: "Estrutural", weight: 0.6 },
  alimentadora: { label: "Alimentadora", weight: 0.25 },
  local: { label: "Local", weight: 0.15 },
} as const;

export type NetworkKey = keyof typeof NETWORK_CONFIG;

export const NETWORK_KEYS: NetworkKey[] = ["estrutural", "alimentadora", "local"];

const NETWORK_ROAD_KM: Record<NetworkKey, (city: CityDto) => number> = {
  estrutural: (city) => city.structuralKm,
  alimentadora: (city) => city.feederKm,
  local: (city) => city.localKm,
};

export type ScoreBandKey = "score-75-plus" | "score-50-plus" | "score-25-plus" | "score-below-25" | "score-unavailable";

export interface SegmentResultEntry {
  id: string;
  rawSegmentId: string;
  displayName: string;
  neighborhood?: string;
  typeLabel: string;
  hierarchy: NetworkKey | null;
  hierarchyLabel: string;
  lengthKm: number;
  evaluated: boolean;
  formId?: string;
  score: number | null;
  scoreBand: ScoreBandKey;
  a1Rating: IdecicloRating | null;
  adequate: boolean | null;
  contributes: boolean;
  contribution: number;
  geometry: string | null;
}

export interface NetworkResultEntry {
  key: NetworkKey;
  label: string;
  weight: number;
  totalRoadKm: number;
  structuresCount: number;
  evaluatedCount: number;
  pendingCount: number;
  structureKm: number;
  evaluatedKm: number;
  adequateKm: number;
  contributionSum: number;
  gam: number | null;
  weightedContribution: number;
}

export interface CityResultsSummary {
  totalStructures: number;
  evaluatedStructures: number;
  pendingStructures: number;
  totalStructureKm: number;
  evaluatedStructureKm: number;
  classifiedStructures: number;
  unclassifiedStructures: number;
  incompatibleStructures: number;
  validStructures: number;
  validStructureKm: number;
  previewIdeciclo: number;
  officialReady: boolean;
  totalRoadKm: number;
}

export interface CityResultsBreakdown {
  city: CityDto;
  segments: SegmentResultEntry[];
  networks: Record<NetworkKey, NetworkResultEntry>;
  summary: CityResultsSummary;
}

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const clampScore = (value: number | null) => (value === null ? null : Math.min(Math.max(value, 0), 100));

const isRating = (value: unknown): value is IdecicloRating => value === "A" || value === "B" || value === "C" || value === "D";

const normalizeHierarchy = (value: unknown): NetworkKey | null => {
  const normalized = normalizeText(value);
  if (normalized.includes("estrut")) return "estrutural";
  if (normalized.includes("alimenta")) return "alimentadora";
  if (normalized.includes("local")) return "local";
  return null;
};

const stripCityPrefix = (value: string, cityId: string) => (value.startsWith(`${cityId}_`) ? value.slice(cityId.length + 1) : value);

const getReadableSegmentName = (segment: SegmentDto, normalizedId: string) => segment.name.trim() || `Trecho ${normalizedId}`;

export const getScoreBand = (score: number | null): ScoreBandKey => {
  if (score === null) return "score-unavailable";
  if (score >= 75) return "score-75-plus";
  if (score >= 50) return "score-50-plus";
  if (score >= 25) return "score-25-plus";
  return "score-below-25";
};

// What a saved form embeds about its own scoring.
const EmbeddedBreakdownSchema = z.looseObject({
  total: z.number().optional(),
  resolvedRatings: z.record(z.string(), z.string().nullable()).optional(),
});

const resolveFormMetrics = (form: FormDto) => {
  // A form whose answers cannot be read still counts as evaluated, without a score.
  const parsed = PartialFormDataSchema.safeParse(form.responses ? JSON.parse(form.responses) : {});
  const responses = parsed.success ? parsed.data : {};
  const computed = getScoreBreakdown(responses);
  const embedded = EmbeddedBreakdownSchema.safeParse(responses.score_breakdown);
  const embeddedBreakdown = embedded.success ? embedded.data : null;
  const embeddedRatings = responses.criterion_ratings ?? {};
  const a1: CriterionCode = "A1";

  const score = clampScore(responses.total_score ?? embeddedBreakdown?.total ?? computed.total);
  const a1Rating = [embeddedRatings[a1], embeddedBreakdown?.resolvedRatings?.[a1], computed.resolvedRatings[a1]].find(isRating) ?? null;

  return {
    formId: form.id,
    score,
    a1Rating,
    hierarchy: normalizeHierarchy(responses.road_hierarchy) ?? normalizeHierarchy(responses.classification) ?? normalizeHierarchy(form.hierarchy),
    displayName: String(responses.segment_name || form.streetName || "").trim() || null,
  };
};

export const calculateCityResults = (city: CityDto, segments: SegmentDto[], forms: FormDto[]): CityResultsBreakdown => {
  const formMetricsBySegmentId = new Map(forms.map((form) => [stripCityPrefix(form.segmentId, city.id), resolveFormMetrics(form)]));

  const segmentEntries = segments
    .filter((segment) => !segment.parentSegmentId)
    .map<SegmentResultEntry>((segment) => {
      const normalizedId = stripCityPrefix(segment.id, city.id);
      const formMetrics = formMetricsBySegmentId.get(normalizedId);
      const hierarchy = normalizeHierarchy(segment.classification) ?? formMetrics?.hierarchy ?? null;
      const score = formMetrics?.score ?? null;
      const adequate = formMetrics ? (formMetrics.a1Rating ? formMetrics.a1Rating !== "D" : true) : null;
      const contributes = formMetrics !== undefined && hierarchy !== null && adequate === true && score !== null;
      const contribution = contributes && score !== null ? (segment.length * score) / 100 : 0;

      return {
        id: normalizedId,
        rawSegmentId: segment.id,
        displayName: formMetrics?.displayName || getReadableSegmentName(segment, normalizedId),
        neighborhood: segment.neighborhood || undefined,
        typeLabel: segment.type || "Sem tipologia",
        hierarchy,
        hierarchyLabel: hierarchy ? NETWORK_CONFIG[hierarchy].label : "Sem hierarquia",
        lengthKm: segment.length || 0,
        evaluated: formMetrics !== undefined,
        formId: formMetrics?.formId,
        score,
        scoreBand: getScoreBand(score),
        a1Rating: formMetrics?.a1Rating ?? null,
        adequate,
        contributes,
        contribution,
        geometry: segment.geometry,
      };
    });

  const sumKm = (entries: SegmentResultEntry[]) => entries.reduce((sum, segment) => sum + segment.lengthKm, 0);

  const buildNetwork = (key: NetworkKey): NetworkResultEntry => {
    const totalRoadKm = NETWORK_ROAD_KM[key](city) || 0;
    const entries = segmentEntries.filter((segment) => segment.hierarchy === key);
    const evaluated = entries.filter((segment) => segment.evaluated);
    const contributionSum = entries.reduce((sum, segment) => sum + segment.contribution, 0);
    const gam = totalRoadKm > 0 ? contributionSum / totalRoadKm : null;

    return {
      key,
      label: NETWORK_CONFIG[key].label,
      weight: NETWORK_CONFIG[key].weight,
      totalRoadKm,
      structuresCount: entries.length,
      evaluatedCount: evaluated.length,
      pendingCount: Math.max(entries.length - evaluated.length, 0),
      structureKm: sumKm(entries),
      evaluatedKm: sumKm(evaluated),
      adequateKm: sumKm(entries.filter((segment) => segment.contributes)),
      contributionSum,
      gam,
      weightedContribution: gam !== null ? gam * NETWORK_CONFIG[key].weight : 0,
    };
  };

  const networks: Record<NetworkKey, NetworkResultEntry> = {
    estrutural: buildNetwork("estrutural"),
    alimentadora: buildNetwork("alimentadora"),
    local: buildNetwork("local"),
  };

  const totalStructures = segmentEntries.length;
  const evaluatedEntries = segmentEntries.filter((segment) => segment.evaluated);
  const classifiedStructures = segmentEntries.filter((segment) => segment.hierarchy !== null).length;
  const validSegments = segmentEntries.filter((segment) => segment.contributes);

  return {
    city,
    segments: segmentEntries,
    networks,
    summary: {
      totalStructures,
      evaluatedStructures: evaluatedEntries.length,
      pendingStructures: Math.max(totalStructures - evaluatedEntries.length, 0),
      totalStructureKm: sumKm(segmentEntries),
      evaluatedStructureKm: sumKm(evaluatedEntries),
      classifiedStructures,
      unclassifiedStructures: Math.max(totalStructures - classifiedStructures, 0),
      incompatibleStructures: evaluatedEntries.filter((segment) => segment.adequate === false).length,
      validStructures: validSegments.length,
      validStructureKm: sumKm(validSegments),
      previewIdeciclo: NETWORK_KEYS.reduce((sum, key) => sum + networks[key].weightedContribution, 0),
      officialReady: totalStructures > 0 && evaluatedEntries.length === totalStructures && classifiedStructures === totalStructures,
      totalRoadKm: NETWORK_KEYS.reduce((sum, key) => sum + networks[key].totalRoadKm, 0),
    },
  };
};
