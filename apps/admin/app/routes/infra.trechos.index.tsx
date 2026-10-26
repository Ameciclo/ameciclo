import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { normalizeStreetName, roadClass } from "@ameciclo/db/cycling-streets";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { StatusBar } from "~/components/StatusBar";
import { formatNumber } from "~/lib/format";
import { formatKm, isWayStatus, STATUS, STATUS_ORDER, type WayStatus } from "~/lib/infra";
import { createStretches, infraQueryKey, type WayRow, waysQueryOptions } from "~/queries/infra";

type Search = { agrupar: boolean; q: string };

export const Route = createFileRoute("/infra/trechos/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    agrupar: search.agrupar !== false && search.agrupar !== "false",
    q: typeof search.q === "string" ? search.q : "",
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(waysQueryOptions()),
  component: TrechosPage,
});

const numeric = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

// A trecho is a stretch of street made of several OpenStreetMap segments, e.g. the
// dozens of "Avenida Afonso Olindense" ways that are all a ciclofaixa. Confirmed
// trechos come from the database; loose segments are grouped by normalized name,
// city, built typology and road hierarchy, and offered as suggestions.
type Street = {
  key: string;
  stretchId: number | null;
  name: string | null;
  city: string | null;
  built: string | null;
  segments: number;
  km: number;
  byStatus: Record<WayStatus, number>;
  projects: string[];
  wayIds: number[];
};

function groupStreets(ways: WayRow[]): Street[] {
  const groups = new Map<string, Street>();
  for (const w of ways) {
    // Unnamed ways are grouped by what they belong to instead: the same project, in the same city.
    const key =
      w.stretchId !== null
        ? `t${w.stretchId}`
        : `${w.name ? normalizeStreetName(w.name) : `sem nome ${w.projects.join("+")}`}|${roadClass(w.highway)}|${w.city}|${w.built}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        stretchId: w.stretchId,
        name: w.stretchName ?? w.name,
        city: w.city,
        built: w.built,
        segments: 0,
        km: 0,
        byStatus: { pdc_realizado_designado: 0, pdc_realizado_nao_designado: 0, realizado_fora_pdc: 0, pdc_nao_realizado: 0 },
        projects: [],
        wayIds: [],
      };
      groups.set(key, g);
    }
    g.segments += 1;
    g.km += w.km;
    g.wayIds.push(w.id);
    if (isWayStatus(w.status)) g.byStatus[w.status] += w.km;
    for (const p of w.projects) if (!g.projects.includes(p)) g.projects.push(p);
  }
  return [...groups.values()];
}

// A named group of loose segments that could become a trecho.
const isSuggestion = (s: Street) => s.stretchId === null && s.name !== null && s.segments >= 2;

function makeStreetColumns(confirm: (street: Street) => void, busy: boolean): TableColumn<Street>[] {
  return [
    {
      id: "name",
      header: "Trecho",
      // Unnamed groups sort last.
      accessorFn: (s) => s.name ?? "\uffff",
      cell: ({ row }) => {
        const s = row.original;
        const label = s.name ?? <span className="text-muted-foreground">sem nome{s.projects.length ? ` · ${s.projects.join(", ")}` : ""}</span>;
        const className = "font-medium underline-offset-2 hover:underline";
        if (s.stretchId !== null)
          return (
            <Link to="/infra/trechos/trecho/$id" params={{ id: String(s.stretchId) }} className={className}>
              {label}
            </Link>
          );
        if (s.segments === 1)
          return (
            <Link to="/infra/trechos/$id" params={{ id: String(s.wayIds[0]) }} className={className}>
              {label}
            </Link>
          );
        return (
          <Link to="/infra/trechos" search={{ agrupar: false, q: s.name ?? s.projects[0] ?? "" }} className={className}>
            {label}
          </Link>
        );
      },
    },
    { accessorKey: "city", header: "Cidade", cell: ({ row }) => row.original.city ?? "—" },
    { accessorKey: "built", header: "Construído", cell: ({ row }) => row.original.built ?? "—" },
    { accessorKey: "segments", header: "Segmentos", meta: numeric },
    { accessorKey: "km", header: "km", cell: ({ row }) => formatKm(row.original.km), meta: numeric },
    { id: "bar", header: "Status", enableSorting: false, cell: ({ row }) => <StatusBar km={row.original.byStatus} /> },
    { id: "projects", header: "Projetos", accessorFn: (s) => s.projects.join(", ") || "—" },
    {
      id: "situacao",
      header: "Situação",
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        if (s.stretchId !== null) return <Badge variant="secondary">Confirmado</Badge>;
        if (!isSuggestion(s)) return <span className="text-muted-foreground">—</span>;
        return (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => confirm(s)}>
            Confirmar
          </Button>
        );
      },
    },
  ];
}

const wayColumns: TableColumn<WayRow>[] = [
  {
    accessorKey: "name",
    header: "Trecho",
    cell: ({ row }) => (
      <Link to="/infra/trechos/$id" params={{ id: String(row.original.id) }} className="font-medium underline-offset-2 hover:underline">
        {row.original.name ?? <span className="text-muted-foreground">sem nome · {row.original.osmId}</span>}
      </Link>
    ),
  },
  { accessorKey: "highway", header: "Via", cell: ({ row }) => row.original.highway ?? "—" },
  {
    accessorKey: "city",
    header: "Cidade",
    cell: ({ row }) => (
      <>
        {row.original.city ?? "—"}
        {row.original.cityManual && <span className="ml-1 text-xs text-muted-foreground">(manual)</span>}
      </>
    ),
  },
  { accessorKey: "built", header: "Construído", cell: ({ row }) => row.original.built ?? "—" },
  { id: "projects", header: "Projetos", accessorFn: (w) => w.projects.join(", ") || "—" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      isWayStatus(row.original.status) ? (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: STATUS[row.original.status].color }} />
          {STATUS[row.original.status].label}
        </Badge>
      ) : (
        "—"
      ),
  },
  { accessorKey: "km", header: "km", cell: ({ row }) => formatKm(row.original.km), meta: numeric },
];

const ALL = "all";
const NONE = "none";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: todos</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const uniq = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => v !== null))].sort((a, b) => a.localeCompare(b));

function TrechosPage() {
  const { data: ways } = useSuspenseQuery(waysQueryOptions());
  const { agrupar, q } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [city, setCity] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [built, setBuilt] = useState(ALL);
  const [plan, setPlan] = useState(ALL);
  const [situation, setSituation] = useState(ALL);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: (groups: Street[]) =>
      createStretches({ data: { stretches: groups.map((g) => ({ name: g.name ?? "", wayIds: g.wayIds })) } }),
    onSuccess: async ({ created }) => {
      setMessage(`${formatNumber(created)} ${created === 1 ? "trecho confirmado" : "trechos confirmados"}.`);
      await queryClient.invalidateQueries({ queryKey: infraQueryKey });
    },
  });

  const filtered = ways.filter(
    (w) =>
      (city === ALL || w.city === city) &&
      (status === ALL || w.status === status) &&
      (built === ALL || (built === NONE ? w.built === null : w.built === built)) &&
      (plan === ALL || (plan === "in" ? w.projects.length > 0 : w.projects.length === 0)),
  );
  const allStreets = groupStreets(filtered);
  const streets = allStreets.filter(
    (s) =>
      situation === ALL ||
      (situation === "confirmed" && s.stretchId !== null) ||
      (situation === "suggested" && isSuggestion(s)),
  );
  const suggestions = streets.filter(isSuggestion);
  const streetColumns = makeStreetColumns((street) => confirmMutation.mutate([street]), confirmMutation.isPending);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect label="Cidade" value={city} onChange={setCity} options={uniq(ways.map((w) => w.city)).map((c) => ({ value: c, label: c }))} />
      <FilterSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS[s].label }))}
      />
      <FilterSelect
        label="Construído"
        value={built}
        onChange={setBuilt}
        options={[...uniq(ways.map((w) => w.built)).map((b) => ({ value: b, label: b })), { value: NONE, label: "Sem ciclovia" }]}
      />
      <FilterSelect
        label="Plano"
        value={plan}
        onChange={setPlan}
        options={[
          { value: "in", label: "Em algum projeto" },
          { value: "out", label: "Fora do plano" },
        ]}
      />
      {agrupar && (
        <FilterSelect
          label="Situação"
          value={situation}
          onChange={setSituation}
          options={[
            { value: "confirmed", label: "Confirmados" },
            { value: "suggested", label: "Sugeridos" },
          ]}
        />
      )}
      {agrupar && suggestions.length > 0 && (
        <Button size="sm" disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate(suggestions)}>
          {confirmMutation.isPending ? "Confirmando…" : `Confirmar ${formatNumber(suggestions.length)} sugestões`}
        </Button>
      )}
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
      <div className="flex rounded-md border text-sm">
        {[
          { value: true, label: "Por trecho" },
          { value: false, label: "Segmentos" },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => void navigate({ search: { agrupar: o.value, q } })}
            className={`px-3 py-1.5 ${agrupar === o.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <AdminTopbar
        title="Trechos"
        description={`${formatNumber(filtered.length)} segmentos do OpenStreetMap${agrupar ? ` em ${formatNumber(streets.length)} trechos` : ""} · ${formatKm(filtered.reduce((sum, w) => sum + w.km, 0))} km.`}
      />
      <div className="flex-1 px-6 py-6">
        {/* key: the filter starts from the search param, so switching views rebuilds the table. */}
        {agrupar ? (
          <DataTable
            key={`trechos-${q}`}
            columns={streetColumns}
            data={streets}
            filterPlaceholder="Buscar trecho, cidade ou projeto..."
            initialFilter={q}
            toolbar={toolbar}
            initialSorting={[{ id: "name", desc: false }]}
          />
        ) : (
          <DataTable
            key={`segmentos-${q}`}
            columns={wayColumns}
            data={filtered}
            filterPlaceholder="Buscar por nome, cidade, projeto ou status..."
            initialFilter={q}
            toolbar={toolbar}
            pageSize={25}
          />
        )}
      </div>
    </>
  );
}
