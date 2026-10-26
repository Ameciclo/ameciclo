import { Link } from "@tanstack/react-router";
import { ArrowRight, Filter, MapPinned, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import { cn } from "@ameciclo/ui/lib/utils";
import { NETWORK_CONFIG, type NetworkKey, type SegmentResultEntry } from "~/lib/ideciclo/results";
import { parseLineGeometry } from "~/lib/ideciclo/segment-technical";
import {
  CALCULATION_OPTIONS,
  DEFAULT_FILTERS,
  filterSegments,
  formatCount,
  formatKm,
  formatPercent,
  formatScore,
  HIERARCHY_BADGE_CLASSNAME,
  HIERARCHY_OPTIONS,
  hasActiveFilters,
  SCORE_BAND_LABELS,
  SCORE_BAND_OPTIONS,
  SEGMENT_TYPE_COLORS,
  type SegmentFilters,
  scoreBandBadgeClassName,
  segmentStatusClassName,
  segmentStatusLabel,
  segmentTypeBadgeClassName,
  SORT_DIRECTION_OPTIONS,
  SORT_FIELD_OPTIONS,
  STATUS_OPTIONS,
  typeOptions,
} from "~/lib/ideciclo/results-view";
import { LinesMap, type MapLine } from "../form/LinesMap";

const NO_TYPE_COLOR = "#475569";

type FilterSelectProps<V extends string> = {
  value: V;
  options: { value: V; label: string }[];
  placeholder: string;
  onChange: (value: V) => void;
};

function FilterSelect<V extends string>({ value, options, placeholder, onChange }: FilterSelectProps<V>) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const option = options.find((item) => item.value === next);
        if (option) onChange(option.value);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// The city's structures on a map and in a table, with filters; picking one
// shows its numbers and the way to evaluate it.
export function SegmentsExplorer({ segments }: { segments: SegmentResultEntry[] }) {
  const [filters, setFilters] = useState<SegmentFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const set = (partial: Partial<SegmentFilters>) => setFilters((current) => ({ ...current, ...partial }));

  const filtered = filterSegments(segments, filters);
  // The selection follows the filters: if it drops out of the list, the first one takes over.
  const selected = filtered.find((segment) => segment.id === selectedId) ?? filtered[0] ?? null;
  const types = typeOptions(segments);
  const typeSelectOptions = [{ value: "todos", label: "Tipologia: todas" }, ...types.map((type) => ({ value: type, label: type }))];

  // Geometry is parsed once per load, not on every filter change.
  const geometries = useMemo(() => new Map(segments.map((segment) => [segment.id, parseLineGeometry(segment.geometry)])), [segments]);
  const lines: MapLine[] = filtered.flatMap((segment) => {
    const geometry = geometries.get(segment.id);
    return geometry ? [{ id: segment.id, geometry, color: SEGMENT_TYPE_COLORS[segment.typeLabel] ?? NO_TYPE_COLOR, muted: !segment.evaluated }] : [];
  });
  const fitKey = `${filtered.length}:${filtered[0]?.id ?? ""}:${filtered[filtered.length - 1]?.id ?? ""}`;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="size-5 text-ideciclo-blue" />
              Mapa das estruturas e filtros de acompanhamento
            </CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Filtre por nota, tipologia, hierarquia e status para localizar rápido os trechos que ainda faltam ou que já estão entrando na prévia do IDECICLO.
            </p>
          </div>
          {hasActiveFilters(filters) ? (
            <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Limpar filtros
            </Button>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={filters.search} onChange={(event) => set({ search: event.target.value })} placeholder="Buscar trecho, bairro ou ID" className="pl-9" />
            </div>
          </div>
          <FilterSelect value={filters.status} options={STATUS_OPTIONS} placeholder="Status" onChange={(status) => set({ status })} />
          <FilterSelect value={filters.scoreBand} options={SCORE_BAND_OPTIONS} placeholder="Faixa da nota" onChange={(scoreBand) => set({ scoreBand })} />
          <FilterSelect value={filters.type} options={typeSelectOptions} placeholder="Tipologia" onChange={(type) => set({ type })} />
          <FilterSelect value={filters.hierarchy} options={HIERARCHY_OPTIONS} placeholder="Hierarquia" onChange={(hierarchy) => set({ hierarchy })} />
          <FilterSelect value={filters.calculation} options={CALCULATION_OPTIONS} placeholder="Situação no cálculo" onChange={(calculation) => set({ calculation })} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          {lines.length > 0 ? (
            <LinesMap lines={lines} selectedId={selected?.id ?? null} onSelect={setSelectedId} fitKey={fitKey} className="h-[420px] w-full overflow-hidden rounded-[28px] border border-slate-200" />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              <div>
                <p className="text-base font-semibold">Nenhuma estrutura visível com os filtros atuais</p>
                <p className="mt-1 text-sm">Ajuste os filtros para exibir os trechos no mapa.</p>
              </div>
            </div>
          )}

          <SelectedSegmentPanel segment={selected} />
        </div>

        <div className="rounded-[28px] border border-slate-200">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-semibold text-slate-950">Tabela das estruturas</h4>
                <p className="text-sm text-slate-600">{formatCount(filtered.length)} trecho(s) visível(is) com os filtros atuais.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Entram no cálculo</Badge>
                <Badge className="border-rose-200 bg-rose-50 text-rose-700">A1 = D / incompatíveis</Badge>
                <Badge className="border-slate-200 bg-slate-100 text-slate-700">Pendente ou sem nota</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <FilterSelect value={filters.sortField} options={SORT_FIELD_OPTIONS} placeholder="Ordenar por" onChange={(sortField) => set({ sortField })} />
                <FilterSelect value={filters.sortDirection} options={SORT_DIRECTION_OPTIONS} placeholder="Direção" onChange={(sortDirection) => set({ sortDirection })} />
                {(["estrutural", "alimentadora", "local"] satisfies NetworkKey[]).map((key) => (
                  <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {NETWORK_CONFIG[key].label}: peso {formatPercent(NETWORK_CONFIG[key].weight * 100)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trecho</TableHead>
                <TableHead>Tipologia</TableHead>
                <TableHead>Hierarquia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Extensão</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Contribuição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((segment) => (
                  <TableRow key={segment.id} className={cn("cursor-pointer", segment.id === selected?.id && "bg-slate-50")} onClick={() => setSelectedId(segment.id)}>
                    <TableCell>
                      <div className="font-medium text-slate-950">{segment.displayName}</div>
                      <div className="text-xs text-slate-500">{segment.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", segmentTypeBadgeClassName(segment.typeLabel))}>{segment.typeLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      {segment.hierarchy ? (
                        <Badge className={cn("border", HIERARCHY_BADGE_CLASSNAME[segment.hierarchy])}>{segment.hierarchyLabel}</Badge>
                      ) : (
                        <Badge variant="outline">Sem hierarquia</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", segmentStatusClassName(segment))}>{segmentStatusLabel(segment)}</Badge>
                    </TableCell>
                    <TableCell>{formatKm(segment.lengthKm)} km</TableCell>
                    <TableCell>{segment.score === null ? "-" : `${formatScore(segment.score)}/100`}</TableCell>
                    <TableCell>{formatKm(segment.contribution)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum trecho encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectedSegmentPanel({ segment }: { segment: SegmentResultEntry | null }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-500">
        <Filter className="size-4" />
        Trecho selecionado
      </div>

      {segment ? (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-2xl font-bold text-slate-950">{segment.displayName}</h4>
            <p className="mt-1 text-sm text-slate-600">{segment.neighborhood || "Bairro não informado"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border", segmentStatusClassName(segment))}>{segmentStatusLabel(segment)}</Badge>
            <Badge className={cn("border", segmentTypeBadgeClassName(segment.typeLabel))}>{segment.typeLabel}</Badge>
            {segment.hierarchy ? <Badge className={cn("border", HIERARCHY_BADGE_CLASSNAME[segment.hierarchy])}>{segment.hierarchyLabel}</Badge> : null}
            <Badge className={cn("border", scoreBandBadgeClassName(segment.scoreBand))}>{SCORE_BAND_LABELS[segment.scoreBand]}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Figure label="Extensão">{formatKm(segment.lengthKm)} km</Figure>
            <Figure label="Nota">{segment.score === null ? "-" : `${formatScore(segment.score)}/100`}</Figure>
            <Figure label="A1">{segment.a1Rating || "-"}</Figure>
            <Figure label="Contribuição">{formatKm(segment.contribution)}</Figure>
          </div>

          <p className="text-sm text-slate-600">
            {segment.formId
              ? "Este trecho já tem formulário salvo. Você pode revisar a avaliação ou usar a seleção para cruzar com a tabela abaixo."
              : "Este trecho ainda não foi avaliado. A página de avaliação abre o formulário já vinculado a ele."}
          </p>

          <Button asChild className="w-full">
            <Link to="/avaliacao/formulario-ideciclo/$segmentId" params={{ segmentId: segment.rawSegmentId }} search={{}}>
              {segment.formId ? "Ver avaliação" : "Avaliar este trecho"}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Selecione um trecho no mapa ou na tabela para ver mais detalhes.
        </div>
      )}
    </div>
  );
}

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold text-slate-950">{children}</div>
    </div>
  );
}
