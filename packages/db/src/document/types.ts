export type Basis = "observed" | "projected";
export type Block = "padroes" | "observacoes";

export type DocumentHeader = {
  localId: number;
  variant: string | null;
  date: string;
  sourceDate: string | null;
  dateNote: string | null;
  startedAt: string | null;
  endedAt: string | null;
  topology: "point" | "t_junction" | "crossroad";
  bucketMinutes: number;
  granularity: "hourly" | "total";
  observedBuckets: number[] | null;
  isProjected: boolean;
  status: "draft" | "published";
  reportUrl: string | null;
  notes: string | null;
  layout: string | null;
};

export type DocumentMovement = {
  basis: Basis;
  from: number;
  to: number;
  // One value per bucket. A session total (no hourly split) goes in `total`.
  cells: number[];
  total: number | null;
};

export type DocumentObservation = {
  basis: Basis;
  block: Block;
  position: number;
  rawLabel: string;
  characteristicKey: string | null;
  cells: number[];
  total: number | null;
};

export type DocumentCondition = {
  bucket: number;
  kind: string;
  value: number | null;
  note: string | null;
};

export type DocumentNote = {
  bucketFrom: number | null;
  bucketTo: number | null;
  text: string;
};

// The full editable state of one contagem. Revisions store this as-is.
export type ContagemDocument = {
  schemaVersion: 1;
  header: DocumentHeader;
  approaches: string[];
  movements: DocumentMovement[];
  observations: DocumentObservation[];
  conditions: DocumentCondition[];
  notes: DocumentNote[];
};

export type DocumentChange = {
  section: "header" | "approaches" | "movements" | "observations" | "conditions" | "notes";
  label: string;
  before: string | null;
  after: string | null;
};

export type RevisionKind = "import" | "create" | "edit" | "revert";
