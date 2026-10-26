import type { SegmentType } from "./segment-technical";

// The rows the evaluation screens work with, shaped for server functions
// (plain values only: no Date, no jsonb as `unknown`).

export type CityDto = {
  id: string;
  name: string;
  state: string;
  evaluatedKm: number;
  ideciclo: number;
  structuralKm: number;
  feederKm: number;
  localKm: number;
  showInRanking: boolean;
};

export type SegmentDto = {
  id: string;
  cityId: string;
  name: string;
  type: SegmentType;
  length: number;
  neighborhood: string | null;
  // GeoJSON text.
  geometry: string | null;
  classification: string | null;
  parentSegmentId: string | null;
  evaluated: boolean;
  formId: string | null;
};

export type FormDto = {
  id: string;
  segmentId: string;
  cityId: string;
  researcher: string | null;
  streetName: string | null;
  hierarchy: string | null;
  // The answers as JSON text; parse with PartialFormDataSchema.
  responses: string | null;
};
