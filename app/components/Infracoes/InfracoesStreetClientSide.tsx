"use client";

import { Link } from "@tanstack/react-router";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { VerticalBarChart } from "~/components/Charts/VerticalBarChart";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";
import Table from "~/components/Commom/Table/Table";

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
  overview: { totalViolations: number };
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  loading: boolean;
}

export default function InfracoesStreetClientSide({ streetData, overview, availableYears, selectedYear, onYearChange, loading }: Props) {
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
  const violationsPerKm = streetData?.violations_per_km ?? 0;
  const topViolations = streetData?.top_violations ?? [];
  const temporal = streetData?.temporal ?? {};
  const agents = streetData?.agents ?? [];
  const pct = overview.totalViolations > 0 ? ((total / overview.totalViolations) * 100).toFixed(1) : "0.0";

  return (
    <div className={`pb-16 transition-opacity duration-150 ${loading ? 'opacity-60' : ''}`}>
      <StatisticsBox
        title={`Infrações na ${name}`}
        subtitle={extensionKm > 0
          ? `${total.toLocaleString("pt-BR")} infrações · ${extensionKm.toFixed(1)} km · ${violationsPerKm.toFixed(0)} infr/km · ${pct}% da base`
          : `${total.toLocaleString("pt-BR")} infrações · ${pct}% da base`}
        boxes={[]}
      />
      {availableYears.length > 0 && (
        <div className="container mx-auto mb-6 sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-3 px-4 rounded-b-lg border-b border-gray-200 shadow-sm">
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-600">Filtrar por ano:</span>
            <button onClick={() => onYearChange(null)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === null ? "bg-ameciclo text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>Todo o período</button>
            {availableYears.map((year) => (
              <button key={year} onClick={() => onYearChange(year)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === year ? "bg-ameciclo text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>{year}</button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto">
        <Link to="/dados/infracoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ameciclo mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Voltar para visão geral
        </Link>

        {/* ═══ Quando Acontecem ═══ */}
        {temporal?.by_year && Object.keys(temporal.by_year).length > 0 && (
          <Section title="Quando Acontecem" subtitle={`Evolução anual das infrações na ${name}.`}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Evolução Anual{selectedYear ? ` — ${selectedYear}` : ""}</h3>
              <VerticalBarChart
                title="" xAxisTitle="" yAxisTitle="Infrações"
                data={Object.entries(temporal.by_year).sort(([a], [b]) => a.localeCompare(b)).map(([year, count]) => ({ label: year, count: count as number }))}
                xKey="label" yKeys={["count"]}
                colorByLabel={selectedYear ? (l: string) => l === String(selectedYear) ? '#3b82f6' : '#d1d5db' : () => '#3b82f6'}
              />
            </div>
          </Section>
        )}

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
              subtitle={`${topViolations.length} infrações encontradas · ${subtitle}`}
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
