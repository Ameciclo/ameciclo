import { Filter } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { CLASSIFICATION_LABEL, CLASSIFICATIONS, SEGMENT_TYPES } from "~/lib/osm/types";

export type SegmentFilters = {
  name: string;
  type: string;
  classification: string;
  minKm: string;
  maxKm: string;
};

export const NO_FILTERS: SegmentFilters = { name: "", type: "all", classification: "all", minKm: "", maxKm: "" };
export const UNCLASSIFIED = "none";

type Props = { filters: SegmentFilters; onChange: (filters: SegmentFilters) => void };

export function SegmentsFilterBar({ filters, onChange }: Props) {
  const set = (patch: Partial<SegmentFilters>) => onChange({ ...filters, ...patch });
  const active = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1">
        <Label htmlFor="filter-name">Procurar por nome</Label>
        <Input id="filter-name" className="w-52" value={filters.name} onChange={(e) => set({ name: e.target.value })} placeholder="Digite um nome..." />
      </div>
      <div className="space-y-1">
        <Label>Tipologia</Label>
        <Select value={filters.type} onValueChange={(type) => set({ type })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {SEGMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Hierarquia da via</Label>
        <Select value={filters.classification} onValueChange={(classification) => set({ classification })}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CLASSIFICATIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {CLASSIFICATION_LABEL[c]}
              </SelectItem>
            ))}
            <SelectItem value={UNCLASSIFIED}>Não classificada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="filter-min">Extensão (km)</Label>
        <div className="flex items-center gap-2">
          <Input id="filter-min" className="w-20" inputMode="decimal" placeholder="mín" value={filters.minKm} onChange={(e) => set({ minKm: e.target.value })} />
          <span className="text-muted-foreground">a</span>
          <Input className="w-20" inputMode="decimal" placeholder="máx" aria-label="Extensão máxima" value={filters.maxKm} onChange={(e) => set({ maxKm: e.target.value })} />
        </div>
      </div>
      <Button variant="outline" onClick={() => onChange(NO_FILTERS)} disabled={!active} className="gap-2">
        <Filter className="size-4" />
        Limpar
      </Button>
    </div>
  );
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function matchesFilters(
  segment: { name: string; type: string; classification: string | null; km: number },
  filters: SegmentFilters,
): boolean {
  const min = filters.minKm === "" ? undefined : Number(filters.minKm.replace(",", "."));
  const max = filters.maxKm === "" ? undefined : Number(filters.maxKm.replace(",", "."));
  return (
    (filters.name === "" || normalize(segment.name).includes(normalize(filters.name.trim()))) &&
    (filters.type === "all" || segment.type === filters.type) &&
    (filters.classification === "all" ||
      (filters.classification === UNCLASSIFIED ? segment.classification === null : segment.classification === filters.classification)) &&
    (min === undefined || Number.isNaN(min) || segment.km >= min) &&
    (max === undefined || Number.isNaN(max) || segment.km <= max)
  );
}
