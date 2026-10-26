import type { SegmentDto, FormDto } from "./domain";

// The city's IDECICLO as the ranking and the city pages show it: the quality
// rating of each evaluated segment times its length, averaged per network
// (the GAM), weighted by network.

const RATING_VALUES: Record<string, number> = { A: 1.0, B: 0.7, C: 0.4, D: 0.0 };

type NetworkType = "Estrutural" | "Alimentadora" | "Local";

const NETWORKS: NetworkType[] = ["Estrutural", "Alimentadora", "Local"];

const NETWORK_WEIGHTS: Record<NetworkType, number> = {
  Estrutural: 0.59,
  Alimentadora: 0.262,
  Local: 0.148,
};

// Only the criteria answered with an A-D rating enter the average.
const EVALUATION_CRITERIA = [
  "pavement_type",
  "conservation_state",
  "separation_devices_ciclofaixa",
  "separation_devices_ciclovia",
  "separation_devices_calcada",
  "devices_conservation",
  "spacing_conservation",
  "space_identification",
  "identification_conservation",
  "pictograms_conservation",
  "vertical_signs_conservation",
  "intersection_signaling",
  "shading_coverage",
];

type CalcSegment = Pick<SegmentDto, "id" | "length" | "classification">;
type CalcForm = Pick<FormDto, "segmentId"> & { responses: Record<string, unknown> | null };

/** Mean rating value over the answered criteria of one form; 0 when none was answered. */
export const calculateFormRating = (responses: Record<string, unknown> | null): number => {
  if (!responses) return 0;

  let total = 0;
  let count = 0;
  for (const criterion of EVALUATION_CRITERIA) {
    const answer = responses[criterion];
    if (typeof answer !== "string") continue;
    const value = RATING_VALUES[answer];
    if (value === undefined) continue;
    total += value;
    count += 1;
  }

  return count > 0 ? total / count : 0;
};

// A segment without a classification counts as local.
const networkOf = (segment: CalcSegment): NetworkType => {
  if (segment.classification === "estrutural") return "Estrutural";
  if (segment.classification === "alimentadora") return "Alimentadora";
  return "Local";
};

/** GAM: sum of (length x rating) over the evaluated segments, divided by their total length. */
const networkAttendanceRate = (entries: { segment: CalcSegment; form: CalcForm }[]): number => {
  let contribution = 0;
  let length = 0;
  for (const { segment, form } of entries) {
    contribution += segment.length * calculateFormRating(form.responses);
    length += segment.length;
  }
  return length > 0 ? contribution / length : 0;
};

export const calculateIdeciclo = (segments: CalcSegment[], forms: CalcForm[]): number => {
  const byNetwork: Record<NetworkType, { segment: CalcSegment; form: CalcForm }[]> = {
    Estrutural: [],
    Alimentadora: [],
    Local: [],
  };

  for (const segment of segments) {
    const form = forms.find((f) => f.segmentId === segment.id);
    if (form) byNetwork[networkOf(segment)].push({ segment, form });
  }

  return NETWORKS.reduce(
    (sum, network) => sum + networkAttendanceRate(byNetwork[network]) * NETWORK_WEIGHTS[network],
    0,
  );
};

/** A = 1.0, B = [0.7, 1.0), C = [0.4, 0.7), D = [0.0, 0.4). */
export const getIdecicloClassification = (ideciclo: number): "A" | "B" | "C" | "D" => {
  if (ideciclo >= 1.0) return "A";
  if (ideciclo >= 0.7) return "B";
  if (ideciclo >= 0.4) return "C";
  return "D";
};

export const getIdecicloDescription = (classification: string): string => {
  switch (classification) {
    case "A":
      return "Excelente";
    case "B":
      return "Bom";
    case "C":
      return "Regular";
    case "D":
      return "Ruim";
    default:
      return "Não avaliado";
  }
};
