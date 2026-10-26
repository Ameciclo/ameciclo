import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { StatusBar } from "~/components/StatusBar";
import { formatNumber } from "~/lib/format";
import { formatKm, isWayStatus, STATUS, STATUS_ORDER, type WayStatus } from "~/lib/infra";
import { type WayRow, waysQueryOptions } from "~/queries/infra";

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

// Ways of one street in one city with the same built typology, e.g. the dozens of
// OpenStreetMap segments of "Avenida Afonso Olindense" that are all a ciclofaixa.
type Street = {
  key: string;
  name: string | null;
  city: string | null;
  built: string | null;
  segments: number;
  km: number;
  byStatus: Record<WayStatus, number>;
  projects: string[];
  firstId: number;
};

function groupStreets(ways: WayRow[]): Street[] {
  const groups = new Map<string, Street>();
  for (const w of ways) {
    // Unnamed ways are grouped by what they belong to instead: the same project, in the same city.
    const key = `${w.name ?? `sem nome ${w.projects.join("+")}`}|${w.city}|${w.built}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        name: w.name,
        city: w.city,
        built: w.built,
        segments: 0,
        km: 0,
        byStatus: { pdc_realizado_designado: 0, pdc_realizado_nao_designado: 0, realizado_fora_pdc: 0, pdc_nao_realizado: 0 },
        projects: [],
        firstId: w.id,
      };
      groups.set(key, g);
    }
    g.segments += 1;
    g.km += w.km;
    if (isWayStatus(w.status)) g.byStatus[w.status] += w.km;
    for (const p of w.projects) if (!g.projects.includes(p)) g.projects.push(p);
  }
  return [...groups.values()];
}

const streetColumns: TableColumn<Street>[] = [
  {
    id: "name",
    header: "Rua",
    // Unnamed groups sort last.
    accessorFn: (s) => s.name ?? "\uffff",
    cell: ({ row }) => {
      const s = row.original;
      const label = s.name ?? <span className="text-muted-foreground">sem nome{s.projects.length ? ` · ${s.projects.join(", ")}` : ""}</span>;
      const className = "font-medium underline-offset-2 hover:underline";
      if (s.segments === 1)
        return (
          <Link to="/infra/trechos/$id" params={{ id: String(s.firstId) }} className={className}>
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
];

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

  const filtered = ways.filter(
    (w) =>
      (city === ALL || w.city === city) &&
      (status === ALL || w.status === status) &&
      (built === ALL || (built === NONE ? w.built === null : w.built === built)) &&
      (plan === ALL || (plan === "in" ? w.projects.length > 0 : w.projects.length === 0)),
  );
  const streets = groupStreets(filtered);

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
      <div className="flex rounded-md border text-sm">
        {[
          { value: true, label: "Por rua" },
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
        description={`${formatNumber(filtered.length)} segmentos do OpenStreetMap${agrupar ? ` em ${formatNumber(streets.length)} ruas` : ""} · ${formatKm(filtered.reduce((sum, w) => sum + w.km, 0))} km.`}
      />
      <div className="flex-1 px-6 py-6">
        {/* key: the filter starts from the search param, so switching views rebuilds the table. */}
        {agrupar ? (
          <DataTable
            key={`ruas-${q}`}
            columns={streetColumns}
            data={streets}
            filterPlaceholder="Buscar rua, cidade ou projeto..."
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
