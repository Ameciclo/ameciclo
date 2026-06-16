"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";
import { VerticalBarChart } from "~/components/Charts/VerticalBarChart";
import Table from "~/components/Commom/Table/Table";

import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import type { LayerProps } from "react-map-gl/maplibre";
import { infracoesCategoryPageQueryOptions, infracoesTemporalCategoryQueryOptions } from "~/queries/dados.infracoes";
import { slugToCategory } from "./InfracoesClientSide";

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

interface OverviewData {
  totalViolations: number;
  periodStart: string;
  periodEnd: string;
}

interface Props {
  categorySlug: string;
  overview: OverviewData;
  color: string;
}

export default function InfracoesCategoryClientSide({ categorySlug, overview, color }: Props) {
  const categoryName = slugToCategory(categorySlug);
  const totalViolations = overview.totalViolations;
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showStreetFilters, setShowStreetFilters] = useState(false);
  const [selectedViolations, setSelectedViolations] = useState<Set<string>>(new Set());
  const [allTopViolations, setAllTopViolations] = useState<any[]>([]);

  const toggleViolation = useCallback((code: string) => {
    setSelectedViolations(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const dateParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = selectedYear !== null ? {
      start_date: `${selectedYear}-01-01`,
      end_date: `${selectedYear}-12-31`,
    } : {
      start_date: overview.periodStart.slice(0, 10),
      end_date: overview.periodEnd.slice(0, 10),
    };
    if (selectedViolations.size > 0) {
      params.violation_codes = Array.from(selectedViolations).join(',');
    }
    return params;
  }, [selectedYear, selectedViolations, overview.periodStart, overview.periodEnd]);

  const fullRangeParams = useMemo((): Record<string, string> => {
    const params: Record<string, string> = {
      start_date: overview.periodStart.slice(0, 10),
      end_date: overview.periodEnd.slice(0, 10),
    };
    if (selectedViolations.size > 0) {
      params.violation_codes = Array.from(selectedViolations).join(',');
    }
    return params;
  }, [selectedViolations, overview.periodStart, overview.periodEnd]);

  const availableYears: number[] = [];
  const startYear = parseInt(overview.periodStart?.slice(0, 4));
  const endYear = parseInt(overview.periodEnd?.slice(0, 4));
  if (startYear && endYear) {
    for (let y = startYear; y <= endYear; y++) availableYears.push(y);
  }

  // ─── Category data fetch (via TanStack Query) ────────────────────
  const dp = dateParams();
  const {
    data: categoryData,
    isFetching: loading,
  } = useQuery(infracoesCategoryPageQueryOptions(dp, categoryName));

  const { data: fullTemporalData } = useQuery(
    infracoesTemporalCategoryQueryOptions(fullRangeParams, categoryName)
  );

  useEffect(() => {
    if (categoryData?.topViolations && selectedViolations.size === 0) {
      setAllTopViolations(categoryData.topViolations);
    }
  }, [categoryData?.topViolations, selectedViolations.size]);

  // ─── Derived data ────────────────────────────────────────────────
  const categoryTotal = categoryData
    ? categoryData.topViolations.reduce((s: number, v: any) => s + v.count, 0)
    : 0;
  const pct = totalViolations > 0 ? ((categoryTotal / totalViolations) * 100).toFixed(1) : "0.0";
  const mainAgent = categoryData?.agentAnalysis?.length ? categoryData.agentAnalysis[0] : null;

  const topStreetsList = (categoryData?.topStreets ?? []).filter((s: any) => (s.total_violations ?? 0) > 0);
  const totalStreetViolations = topStreetsList.reduce((sum: number, s: any) => sum + (s.total_violations ?? 0), 0);

  const streetTableData = topStreetsList.map((s: any, i: number) => {
    const tv = s.top_violation;
    const ruaSlug = (s.official_name ?? "")
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const total = s.total_violations ?? 0;
    return {
      ranking: i + 1,
      rua: s.official_name,
      rua_slug: ruaSlug,
      street_code: s.street_code,
      total_raw: total,
      extensao_km: s.extension_km?.toFixed(1) ?? "—",
      pct_total: totalStreetViolations > 0 ? `${((total / totalStreetViolations) * 100).toFixed(1)}%` : "—",
      principal_infracao: tv?.description ?? "—",
      pct_via: tv?.percentage != null ? `${tv.percentage.toFixed(1)}%` : "—",
    };
  });

  const colorBreakpoints = { r1: 5000, r2: 10000, r3: 15000 };

  const layersConf: LayerProps[] = useMemo(() => {
    const { r1, r2, r3 } = colorBreakpoints;

    return [{
      id: `infracoes-${categorySlug}`,
      type: "line" as const,
      paint: {
        "line-color": [
          "interpolate",
          ["linear"],
          ["get", "total_violations"],
          0,    "#FEF3C7",
          r1,   "#F59E0B",
          r2,   "#DC2626",
          r3,   "#7F1D1D",
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "total_violations"],
          0,  2,
          r1, 3,
          r2, 5,
          r3, 8,
        ],
        "line-opacity": 0.7,
      },
      layout: {},
    }];
  }, [categorySlug]);

  function fmt(n: number): string {
    return n.toLocaleString("pt-BR");
  }

  const mapLegend = useMemo(() => {
    const { r1, r2, r3 } = colorBreakpoints;

    const bands = [
      { color: "#FEF3C7", label: `0 – ${fmt(r1)}` },
      { color: "#F59E0B", label: `${fmt(r1)} – ${fmt(r2)}` },
      { color: "#DC2626", label: `${fmt(r2)} – ${fmt(r3)}` },
      { color: "#7F1D1D", label: `${fmt(r3)}+` },
    ];

    return (
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 z-10 max-w-[180px]">
        <h3 className="text-xs font-bold text-gray-700 mb-2 text-center">Infrações por via</h3>
        <div className="flex flex-col gap-1.5">
          {bands.map((band, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-6 h-1.5 rounded-sm shrink-0"
                style={{ backgroundColor: band.color }}
              />
              <span className="text-xs text-gray-600">{band.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);

  if (!categoryData && !loading) {
    return (
      <div className="pb-16">
        <div className="bg-white rounded-lg shadow p-8 text-center my-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dados não disponíveis</h3>
          <p className="text-sm text-gray-500">
            Não foi possível carregar os dados para a categoria "{categoryName}".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pb-16 transition-opacity duration-150 ${loading ? 'opacity-60' : ''}`}>
      {/* Year selector */}
      {availableYears.length > 0 && (
        <div className="container mx-auto mb-6 sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-3 px-4 rounded-b-lg border-b border-gray-200 shadow-sm">
          {/* Desktop: pill buttons */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-600">Filtrar por ano:</span>
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedYear === null
                  ? "bg-ameciclo text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Todo o período
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-ameciclo text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Mobile: dropdown */}
          <div className="sm:hidden flex items-center justify-center gap-2">
            <label className="text-sm font-medium text-gray-600 shrink-0">Ano:</label>
            <select
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
              className="w-full max-w-48 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-ameciclo"
            >
              <option value="">Todo o período</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {selectedYear && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Mostrando dados de {selectedYear}. Selecione "Todo o período" para ver dados agregados.
            </p>
          )}
          {selectedViolations.size > 0 && (
            <p className="text-center text-xs text-teal-600 mt-2">
              Filtrando por {selectedViolations.size} infraç{selectedViolations.size === 1 ? 'ão' : 'ões'} selecionada{selectedViolations.size === 1 ? '' : 's'}.
            </p>
          )}
        </div>
      )}

      <div className="container mx-auto">
        {/* Navigation back */}
        <Link
          to="/dados/infracoes"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ameciclo mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para visão geral
        </Link>

        {/* ─── Statistics Cards ─────────────────────────────────── */}
        {categoryData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center" style={{ borderTop: `4px solid ${color}` }}>
            <p className="text-sm uppercase tracking-wider text-gray-500">Total na categoria</p>
            <p className="text-4xl font-bold mt-2" style={{ color }}>{categoryTotal.toLocaleString("pt-BR")}</p>
            <p className="text-xs mt-1 text-gray-500">{pct}% da base total</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-gray-500">Artigos do CTB</p>
            <p className="text-4xl font-bold mt-2 text-ameciclo">{categoryData.topViolations.length}</p>
            <p className="text-xs mt-1 text-gray-500">tipos de infração</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-gray-500">Ruas com registros</p>
            <p className="text-4xl font-bold mt-2 text-ameciclo">
              {categoryData.topStreets.filter((s: any) => s.total_violations > 0).length}
            </p>
            <p className="text-xs mt-1 text-gray-500">no top 20</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-gray-500">Agente principal</p>
            {mainAgent ? (
              <>
                <p className="text-xl font-bold mt-2 text-ameciclo leading-tight">{mainAgent.description}</p>
                <p className="text-xs mt-1 text-gray-500">{mainAgent.total?.toLocaleString("pt-BR")} autuações</p>
              </>
            ) : (
              <p className="text-4xl font-bold mt-2 text-gray-300">-</p>
            )}
          </div>
        </div>

        {/* ─── Onde Acontecem: Mapa + Ruas ──────────────────────── */}
        {categoryData.geojson?.features?.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Onde Acontecem</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 relative">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  Infrações — {categoryName}
                </h3>
                <p className="text-sm text-gray-500">
                  Cada linha representa o trecho de via com infrações registradas.{selectedYear ? ` Ano: ${selectedYear}` : ""}
                </p>
              </div>
              <AmecicloMap
                layerData={categoryData.geojson}
                layersConf={layersConf}
                height="450px"
                showLayersPanel={false}
              />
              {mapLegend}
            </div>

            {streetTableData.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg">
                <Table
                  title=""
                  data={streetTableData}
                  showFilters={showStreetFilters}
                  setShowFilters={setShowStreetFilters}
                  columns={[
                    { Header: "#", accessor: "ranking", disableFilters: true, width: '4%' },
                    { Header: "Rua", accessor: "rua", width: '28%', Cell: ({ value, row }: any) => (
                      <a href={`/dados/infracoes/rua/${row.original.street_code || ''}-${row.original.rua_slug || ''}`} className="text-teal-600 hover:underline">{value}</a>
                    )},
                    { Header: "Extensão", accessor: "extensao_km", disableFilters: true, width: '10%' },
                    { Header: "Total", accessor: "total_raw", disableFilters: true, width: '10%', Cell: ({ value }: { value: number }) => value.toLocaleString("pt-BR") },
                    { Header: "% do Total", accessor: "pct_total", disableFilters: true, width: '10%' },
                    { Header: "Principal Infração", accessor: "principal_infracao", width: '28%' },
                    { Header: "% da Via", accessor: "pct_via", disableFilters: true, width: '10%' },
                  ]}
                />
              </div>
            )}
          </section>
        ) : streetTableData.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Onde Acontecem</h2>
            <div className="bg-white rounded-lg shadow-lg">
              <Table
                title=""
                data={streetTableData}
                showFilters={showStreetFilters}
                setShowFilters={setShowStreetFilters}
                columns={[
                  { Header: "#", accessor: "ranking", disableFilters: true, width: '4%' },
                  { Header: "Rua", accessor: "rua", width: '28%', Cell: ({ value, row }: any) => (
                    <a href={`/dados/infracoes/rua/${row.original.street_code || ''}-${row.original.rua_slug || ''}`} className="text-teal-600 hover:underline">{value}</a>
                  )},
                  { Header: "Extensão", accessor: "extensao_km", disableFilters: true, width: '10%' },
                  { Header: "Total", accessor: "total_raw", disableFilters: true, width: '10%', Cell: ({ value }: { value: number }) => value.toLocaleString("pt-BR") },
                  { Header: "% do Total", accessor: "pct_total", disableFilters: true, width: '10%' },
                  { Header: "Principal Infração", accessor: "principal_infracao", width: '28%' },
                  { Header: "% da Via", accessor: "pct_via", disableFilters: true, width: '10%' },
                ]}
              />
            </div>
          </section>
        ) : null}

        {/* ─── Temporal Analysis ────────────────────────────────── */}
        {categoryData.temporal && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quando Acontecem</h2>

            {fullTemporalData?.by_year && Object.keys(fullTemporalData.by_year).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Evolução Anual</h3>
                <VerticalBarChart
                  title=""
                  xAxisTitle=""
                  yAxisTitle="Infrações"
                  data={Object.entries(fullTemporalData.by_year)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([year, count]) => ({ label: year, count: count as number }))}
                  xKey="label"
                  yKeys={["count"]}
                  colorByLabel={selectedYear
                    ? (label: string) => label === String(selectedYear) ? '#dc2626' : '#d1d5db'
                    : () => color}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {categoryData.temporal.by_month && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por mês</h4>
                  <VerticalBarChart
                    title="" xAxisTitle="" yAxisTitle=""
                    data={getAllMonthsData(categoryData.temporal.by_month)}
                    xKey="label" yKeys={["count"]} colors={[color]}
                  />
                </div>
              )}
              {categoryData.temporal.by_weekday && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por dia da semana</h4>
                  <VerticalBarChart
                    title="" xAxisTitle="" yAxisTitle=""
                    data={WEEKDAY_ORDER.map((day) => ({ label: WEEKDAY_LABELS[day], count: categoryData.temporal.by_weekday[day] ?? 0 }))}
                    xKey="label" yKeys={["count"]} colors={["#10b981"]}
                  />
                </div>
              )}
              {categoryData.temporal.by_hour && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por hora do dia</h4>
                  <VerticalBarChart
                    title="" xAxisTitle="" yAxisTitle=""
                    data={Object.entries(categoryData.temporal.by_hour)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([hour, count]) => ({ label: `${hour}h`, count: count as number }))}
                    xKey="label" yKeys={["count"]} colors={["#8b5cf6"]}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Agent Analysis ───────────────────────────────────── */}
        {categoryData.agentAnalysis.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quem Fiscaliza</h2>
            <div className="mb-8">
              <HorizontalBarChart
                title="Percentual por tipo de agente"
                yAxisTitle="% das autuações"
                series={[{
                  name: "Percentual",
                  data: categoryData.agentAnalysis.map((a: any) => ({
                    name: a.description,
                    y: a.percentage,
                  })),
                  color,
                }]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryData.agentAnalysis.map((agent: any) => (
                <div key={agent.agent_id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${agent.category === "eletronico" ? "bg-blue-500" : "bg-amber-500"}`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{agent.description}</h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {agent.category === "eletronico" ? "Fiscalização eletrônica" : "Agente humano"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-ameciclo">{agent.total?.toLocaleString("pt-BR")}</p>
                    <p className="text-sm text-gray-500">{agent.percentage?.toFixed(1)}% das autuações</p>
                  </div>
                  {agent.top_violations?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top infrações</p>
                      <ul className="space-y-1">
                        {agent.top_violations.slice(0, 5).map((v: any, i: number) => (
                          <li key={`${v.law_code}-${i}`} className="text-sm text-gray-700 flex justify-between">
                            <span className="truncate mr-2">{v.law_code ? `${v.law_code} — ` : ""}{v.description}</span>
                            <span className="font-semibold shrink-0">{v.count?.toLocaleString("pt-BR")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Top Infrações ────────────────────────────────────── */}
        {categoryData.topViolations.length > 0 && (
          <div className="mb-8">
            <HorizontalBarChart
              title={`Infrações mais comuns — ${categoryName}`}
              yAxisTitle="Quantidade"
              series={[{
                name: "Infrações",
                data: categoryData.topViolations.map((v: any) => ({
                  name: v.law_code ? `${v.law_code} — ${v.description}` : v.description,
                  y: v.count,
                  ...(selectedViolations.size > 0 ? { color: selectedViolations.has(v.violation_code) ? '#0d9488' : '#d1d5db' } : {}),
                })),
                color: selectedViolations.size > 0 ? undefined : color,
              }]}
            />
          </div>
        )}

        {/* ─── Violation codes table ────────────────────────────── */}
        {categoryData.topViolations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Artigos do CTB nesta Categoria</h2>
            <div className="bg-white rounded-lg shadow-lg">
              <Table
                title=""
                data={(selectedViolations.size > 0 && allTopViolations.length > 0 ? allTopViolations : categoryData.topViolations).map((v: any) => ({
                  violation_code: v.violation_code,
                  base_legal: v.law_code,
                  descricao: v.description,
                  count_raw: v.count,
                }))}
                columns={[
                  {
                    Header: "",
                    accessor: "violation_code",
                    disableFilters: true,
                    disableSortBy: true,
                    width: '4%',
                    Cell: ({ value }: { value: string }) => (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleViolation(value); }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedViolations.has(value)
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-gray-300 hover:border-teal-400'
                        }`}
                        title={selectedViolations.has(value) ? "Remover filtro" : "Filtrar por esta infração"}
                      >
                        {selectedViolations.has(value) && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ),
                  },
                  { Header: "Base Legal", accessor: "base_legal", Cell: ({ value }: { value: string }) => value ? (
                    <a href={`/dados/infracoes/lei/${encodeURIComponent(value)}`} className="text-teal-600 hover:underline">{value}</a>
                  ) : "—" },
                  { Header: "Descrição", accessor: "descricao" },
                  { Header: "Quantidade", accessor: "count_raw", disableFilters: true, Cell: ({ value }: { value: number }) => value.toLocaleString("pt-BR") },
                ]}
              />
            </div>
          </section>
        )}
          </>
        )}
      </div>
    </div>
  );
}
