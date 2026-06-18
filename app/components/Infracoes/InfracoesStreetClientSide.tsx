"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { VerticalBarChart } from "~/components/Charts/VerticalBarChart";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";
import Table from "~/components/Commom/Table/Table";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { infracoesGeoJSONQueryOptions } from "~/queries/dados.infracoes";

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

function getAllMonthsData(byMonth: Record<string, number>): Array<{ label: string; count: number }> {
  return Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");
    return { label: MONTH_LABELS[month], count: byMonth[month] ?? 0 };
  });
}

const WEEKDAY_LABELS: Record<string, string> = {
  monday: "Seg", tuesday: "Ter", wednesday: "Qua",
  thursday: "Qui", friday: "Sex", saturday: "Sáb", sunday: "Dom",
};

const WEEKDAY_ORDER = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="container mx-auto my-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
        {subtitle && <p className="text-gray-600 max-w-4xl mx-auto">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

interface Props {
  streetData: any;
  overview: { totalViolations: number; periodStart: string; periodEnd: string };
  streetCode: string;
  loading: boolean;
}

export default function InfracoesStreetClientSide({ streetData, overview, streetCode, loading }: Props) {
  if (!streetData && !loading) {
    return (
      <div className="pb-16">
        <div className="bg-white rounded-lg shadow p-8 text-center my-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dados não disponíveis</h3>
          <p className="text-sm text-gray-500">Não foi possível carregar os dados desta via.</p>
        </div>
      </div>
    );
  }

  const name = streetData?.official_name ?? "—";
  const total = streetData?.total_violations ?? 0;
  const extensionKm = streetData?.extension_km ?? 0;
  const topViolations = streetData?.top_violations ?? [];
  const temporal = streetData?.temporal ?? {};
  const agents = streetData?.agents ?? [];
  const pct = overview.totalViolations > 0 ? ((total / overview.totalViolations) * 100).toFixed(1) : "0.0";

  const monthCount = useMemo(() => {
    const s = overview.periodStart?.slice(0, 10);
    const e = overview.periodEnd?.slice(0, 10);
    if (!s || !e) return 1;
    const [sy, sm] = s.split("-").map(Number);
    const [ey, em] = e.split("-").map(Number);
    if (!sy || !ey) return 1;
    return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  }, [overview.periodStart, overview.periodEnd]);

  const monthlyAverage = Math.round(total / monthCount);

  const availableYears = useMemo(() => {
    return Object.keys(temporal.by_year ?? {}).map(Number).sort((a, b) => a - b);
  }, [temporal.by_year]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { data: geoData } = useQuery(
    infracoesGeoJSONQueryOptions({ street_code: streetCode, limit: "1", simplify_tolerance: "0.0001" })
  );

  const fmtDate = (d: string) => {
    const parts = (d ?? "").slice(0, 10).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  return (
    <div className={`pb-16 transition-opacity duration-150 ${loading ? 'opacity-60' : ''}`}>
      <StatisticsBox
        title={`Infrações na ${name}`}
        subtitle=""
        boxes={[
          {
            title: "Total de infrações",
            value: streetData ? total.toLocaleString("pt-BR") : "—",
            unit: `${fmtDate(overview.periodStart)} a ${fmtDate(overview.periodEnd)}`,
          },
          {
            title: "Extensão da via",
            value: streetData?.extension_km != null ? `${extensionKm.toFixed(1)} km` : "—",
            unit: "quilômetros",
          },
          {
            title: "Infrações por mês",
            value: streetData ? monthlyAverage.toLocaleString("pt-BR") : "—",
            unit: `em ${monthCount} meses`,
          },
          {
            title: "% da base total",
            value: streetData ? `${pct}%` : "—",
            unit: "das autuações",
          },
        ]}
      />

      {availableYears.length > 0 && (
        <div className="container mx-auto mb-6 sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-3 px-4 rounded-b-lg border-b border-gray-200 shadow-sm">
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-600">Filtrar por ano:</span>
            <button onClick={() => setSelectedYear(null)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === null ? "bg-ameciclo text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>Todo o período</button>
            {availableYears.map((year) => (
              <button key={year} onClick={() => setSelectedYear(year)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === year ? "bg-ameciclo text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>{year}</button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto">
        <Link to="/dados/infracoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ameciclo mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Voltar para visão geral
        </Link>

        {/* ═══ Mapa da via ═══ */}
        {geoData?.features?.length > 0 && (
          <Section title="Localização" subtitle={`Trecho da ${name} com infrações registradas.`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500">
                  Extensão de {extensionKm.toFixed(1)} km com {total.toLocaleString("pt-BR")} infrações registradas.
                </p>
              </div>
              <AmecicloMap
                layerData={geoData}
                layersConf={[{
                  id: `street-${streetCode}`,
                  type: "line" as const,
                  paint: {
                    "line-color": "#3b82f6",
                    "line-width": 4,
                    "line-opacity": 0.8,
                  },
                  layout: {},
                }]}
                height="400px"
                showLayersPanel={false}
              />
            </div>
          </Section>
        )}

        {/* ═══ Quando Acontecem ═══ */}
        <Section
          title={`Quando Acontecem${selectedYear ? ` — ${selectedYear}` : ""}`}
          subtitle={`Distribuição temporal das infrações na ${name}.`}
        >
          {temporal?.by_year && Object.keys(temporal.by_year).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                Evolução Anual{selectedYear ? ` — ${selectedYear}` : ""}
              </h3>
              <VerticalBarChart
                title="" xAxisTitle="" yAxisTitle="Infrações"
                data={Object.entries(temporal.by_year).sort(([a], [b]) => a.localeCompare(b)).map(([year, count]) => ({ label: year, count: count as number }))}
                xKey="label" yKeys={["count"]}
                colorByLabel={selectedYear ? (l: string) => l === String(selectedYear) ? '#3b82f6' : '#d1d5db' : () => '#3b82f6'}
              />
            </div>
          )}

          {temporal ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {temporal.by_month && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por mês</h4>
                  <VerticalBarChart
                    title="" xAxisTitle="" yAxisTitle=""
                    data={getAllMonthsData(temporal.by_month)}
                    xKey="label" yKeys={["count"]} colors={["#3b82f6"]}
                  />
                </div>
              )}
              {temporal.by_weekday && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por dia da semana</h4>
                  <VerticalBarChart
                    title="" xAxisTitle="" yAxisTitle=""
                    data={WEEKDAY_ORDER.map((day) => ({ label: WEEKDAY_LABELS[day], count: temporal.by_weekday[day] ?? 0 }))}
                    xKey="label" yKeys={["count"]} colors={["#10b981"]}
                  />
                </div>
              )}
              {temporal.by_hour && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por hora do dia</h4>
                  <VerticalBarChart
                    title="" xAxisTitle="" yAxisTitle=""
                    data={Object.entries(temporal.by_hour)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([hour, count]) => ({ label: `${hour}h`, count: count as number }))}
                    xKey="label" yKeys={["count"]} colors={["#8b5cf6"]}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Dados temporais não disponíveis.
            </div>
          )}
        </Section>

        {/* ═══ Quem Fiscaliza ═══ */}
        {agents.length > 0 && (
          <Section title="Quem Fiscaliza o Quê" subtitle={`Os dados mostram o que foi fiscalizado na ${name}, não necessariamente tudo que aconteceu.`}>
            <div className="mb-8">
              <HorizontalBarChart
                title="Percentual por tipo de agente" yAxisTitle="% das autuações"
                series={[{ name: "Percentual", data: agents.map((a: any) => ({ name: a.description, y: a.percentage })), color: "#3b82f6" }]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agents.map((agent: any) => (
                <div key={agent.agent_id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${agent.category === "eletronico" ? "bg-blue-500" : "bg-amber-500"}`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{agent.description}</h3>
                      <p className="text-xs text-gray-500 capitalize">{agent.category === "eletronico" ? "Fiscalização eletrônica" : "Agente humano"}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-ameciclo">{agent.total?.toLocaleString("pt-BR")}</p>
                    <p className="text-sm text-gray-500">{agent.percentage?.toFixed(1)}% das autuações</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ Infrações registradas nesta via ═══ */}
        {topViolations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <Table
              title={`Infrações registradas na ${name}`}
              subtitle={`${topViolations.length} infrações encontradas`}
              data={topViolations.map((v: any) => ({
                descricao: v.description,
                count_raw: v.count,
                pct: v.percentage ? `${v.percentage.toFixed(1)}%` : "—",
              }))}
              columns={[
                { Header: "Infração", accessor: "descricao", width: "60%" },
                { Header: "Quantidade", accessor: "count_raw", disableFilters: true, width: "20%", Cell: ({ value }: { value: number }) => value.toLocaleString("pt-BR") },
                { Header: "% da via", accessor: "pct", disableFilters: true, width: "20%" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
