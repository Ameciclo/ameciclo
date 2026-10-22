import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { EvolutionChart } from "~/components/EvolutionChart";
import { formatNumber } from "~/lib/format";
import { profileSurveysQueryOptions, type SurveyRow } from "~/queries/pesquisa-perfil";

export const Route = createFileRoute("/pesquisa-perfil/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(profileSurveysQueryOptions()),
  component: PesquisaPerfilPage,
});

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const percent = (v: number | null) => (v === null ? "—" : `${decimal.format(v)}%`);
const oneDecimal = (v: number | null) => (v === null ? "—" : decimal.format(v));

const right = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

const columns: TableColumn<SurveyRow>[] = [
  { accessorKey: "year", header: "Ano", meta: { cellClassName: "tabular-nums" } },
  {
    accessorKey: "city",
    header: "Cidade",
    cell: ({ row }) => (
      <Link
        to="/pesquisa-perfil/$id"
        params={{ id: String(row.original.id) }}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.original.city}
      </Link>
    ),
  },
  { accessorKey: "interviews", header: "Entrevistas", cell: ({ row }) => formatNumber(row.original.interviews), meta: right },
  { accessorKey: "pctWomen", header: "Mulheres", cell: ({ row }) => percent(row.original.pctWomen), meta: right },
  { accessorKey: "ageAvg", header: "Idade média", cell: ({ row }) => oneDecimal(row.original.ageAvg), meta: right },
  { accessorKey: "daysPerWeek", header: "Dias/semana", cell: ({ row }) => oneDecimal(row.original.daysPerWeek), meta: right },
  { accessorKey: "tripMinutes", header: "Trajeto (min)", cell: ({ row }) => oneDecimal(row.original.tripMinutes), meta: right },
  { accessorKey: "pctCollision", header: "Colisão", cell: ({ row }) => percent(row.original.pctCollision), meta: right },
];

// Indicators compared across the waves of one city
const INDICATORS: { key: keyof SurveyRow; label: string; format: (v: number | null) => string; note?: string }[] = [
  { key: "interviews", label: "Entrevistas", format: (v) => formatNumber(v) },
  { key: "pctWomen", label: "Mulheres", format: percent },
  { key: "ageAvg", label: "Idade média (anos)", format: oneDecimal },
  { key: "daysPerWeek", label: "Dias por semana", format: oneDecimal },
  { key: "tripMinutes", label: "Tempo do trajeto (min)", format: oneDecimal },
  { key: "pctSharedBike", label: "Bicicleta compartilhada", format: percent },
  { key: "pctCombines", label: "Combina com outro modo", format: percent },
  { key: "pctCollision", label: "Colisão ou queda recente", format: percent, note: "2015 e 2018 perguntavam 3 anos; 2021 e 2024, 2 anos" },
  { key: "pctTheft", label: "Furto de bicicleta", format: percent, note: "só 2024" },
  { key: "pctHarassment", label: "Assédio", format: percent, note: "só 2024" },
  { key: "pctElectric", label: "Bicicleta elétrica", format: percent, note: "só 2024" },
];

function PesquisaPerfilPage() {
  const { data: surveys } = useSuspenseQuery(profileSurveysQueryOptions());

  const totals = useMemo(() => {
    const years = new Set(surveys.map((s) => s.year));
    return {
      interviews: surveys.reduce((sum, s) => sum + s.interviews, 0),
      cities: new Set(surveys.map((s) => s.city)).size,
      years: [...years].sort(),
    };
  }, [surveys]);

  // Cities that were surveyed more than once come first: those have an evolution to show.
  const cities = useMemo(() => {
    const waves = new Map<string, number>();
    for (const s of surveys) waves.set(s.city, (waves.get(s.city) ?? 0) + 1);
    return [...waves.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
  }, [surveys]);
  const [city, setCity] = useState(cities.find(([c]) => c === "Recife")?.[0] ?? cities[0]?.[0] ?? "");
  const waves = surveys.filter((s) => s.city === city).sort((a, b) => a.year - b.year);

  const [indicatorKey, setIndicatorKey] = useState<keyof SurveyRow>("pctWomen");
  const [compareWith, setCompareWith] = useState("");
  const indicator = INDICATORS.find((i) => i.key === indicatorKey) as (typeof INDICATORS)[number];
  const compareCity = compareWith && compareWith !== city ? compareWith : "";
  const seriesFor = (name: string) => ({
    name,
    values: new Map(surveys.filter((s) => s.city === name).map((s) => [s.year, s[indicator.key] as number | null])),
  });

  return (
    <>
      <AdminTopbar
        title="Pesquisa Perfil do Ciclista"
        description={`${formatNumber(totals.interviews)} entrevistas em ${formatNumber(surveys.length)} pesquisas, ${totals.years[0]} a ${totals.years.at(-1)}. Só agregados: nenhuma entrevista individual é exibida.`}
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Entrevistas" value={formatNumber(totals.interviews)} />
          <Stat label="Cidades" value={formatNumber(totals.cities)} />
          <Stat label="Edições" value={totals.years.join(" · ")} />
        </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Evolução por cidade</CardTitle>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Cidade
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {cities.map(([name, n]) => (
                  <option key={name} value={name}>
                    {name} ({n} {n === 1 ? "edição" : "edições"})
                  </option>
                ))}
              </select>
            </label>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="mb-4 flex flex-wrap items-end gap-3 text-xs text-muted-foreground">
              <label className="flex flex-col gap-1">
                Indicador no gráfico
                <select
                  value={indicatorKey}
                  onChange={(e) => setIndicatorKey(e.target.value as keyof SurveyRow)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {INDICATORS.map((i) => (
                    <option key={i.key} value={i.key}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Comparar com
                <select
                  value={compareCity}
                  onChange={(e) => setCompareWith(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Nenhuma</option>
                  {cities
                    .filter(([name]) => name !== city)
                    .map(([name, n]) => (
                      <option key={name} value={name}>
                        {name} ({n} {n === 1 ? "edição" : "edições"})
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="mb-6">
              <EvolutionChart
                a={seriesFor(city)}
                b={compareCity ? seriesFor(compareCity) : undefined}
                format={indicator.format}
              />
              {indicator.note && <p className="mt-2 text-xs text-muted-foreground">{indicator.note}</p>}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Indicador</th>
                  {waves.map((w) => (
                    <th key={w.id} className="px-3 py-2 text-right font-medium">
                      <Link to="/pesquisa-perfil/$id" params={{ id: String(w.id) }} className="underline-offset-4 hover:underline">
                        {w.year}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDICATORS.map((ind) => (
                  <tr key={ind.key} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      {ind.label}
                      {ind.note && <span className="ml-2 text-xs text-muted-foreground">{ind.note}</span>}
                    </td>
                    {waves.map((w) => (
                      <td key={w.id} className="px-3 py-2 text-right tabular-nums">
                        {ind.format(w[ind.key] as number | null)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {waves.length === 1 && (
              <p className="mt-3 text-xs text-muted-foreground">Esta cidade foi pesquisada em uma única edição.</p>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-base font-semibold">Todas as pesquisas</h2>
          <DataTable
            columns={columns}
            data={surveys}
            filterPlaceholder="Buscar cidade ou ano..."
            initialSorting={[{ id: "interviews", desc: true }]}
          />
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
