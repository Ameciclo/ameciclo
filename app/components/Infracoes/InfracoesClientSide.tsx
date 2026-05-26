"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";
import { VerticalBarChart } from "~/components/Charts/VerticalBarChart";
import Table from "~/components/Commom/Table/Table";
import { SelectColumnFilter } from "~/components/Commom/Table/TableFilters";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import type { LayerProps } from "react-map-gl/maplibre";
import {
  infracoesStreetsAndGeoQueryOptions,
  infracoesTemporalQueryOptions,
  infracoesAgentsQueryOptions,
  infracoesCategoryTopQueryOptions,
} from "~/queries/dados.infracoes";

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

const CATEGORY_COLORS: Record<string, string> = {
  "Segurança viária": "#dc2626",
  "Pedestres": "#f59e0b",
  "Ciclistas": "#06b6d4",
  "Transporte coletivo": "#8b5cf6",
  "Fluidez do trânsito": "#3b82f6",
  "Estacionamento/uso da via": "#10b981",
  "Administrativas/documentais": "#6b7280",
  "Outras/não classificadas": "#9ca3af",
};

export function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? "#9ca3af";
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "Segurança viária": "seguranca-viaria",
  "Pedestres": "pedestres",
  "Ciclistas": "ciclistas",
  "Transporte coletivo": "transporte-coletivo",
  "Fluidez do trânsito": "fluidez-do-transito",
  "Estacionamento/uso da via": "estacionamento-uso-da-via",
  "Administrativas/documentais": "administrativas-documentais",
  "Outras/não classificadas": "outras-nao-classificadas",
};

function categoryToSlug(name: string): string {
  return CATEGORY_SLUG_MAP[name] ?? name.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCategory(slug: string): string {
  for (const [name, s] of Object.entries(CATEGORY_SLUG_MAP)) {
    if (s === slug) return name;
  }
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ViolationCode {
  code: string;
  lawCode: string;
  description: string;
  count: number;
  category: string;
}

interface CategoryItem {
  name: string;
  codeCount: number;
  totalViolations: number;
}

interface OverviewData {
  totalViolations: number;
  periodStart: string;
  periodEnd: string;
  agentBreakdown: Array<{
    agentId: number;
    description: string;
    count: number;
    percentage: number;
    category: string;
  }>;
}

interface InfracoesClientSideProps {
  overview: OverviewData;
  violationCodes: ViolationCode[];
  categories: CategoryItem[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-sm ${className}`} />;
}

function Section({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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

function getAvailableYears(overview: OverviewData): number[] {
  const start = parseInt(overview.periodStart.slice(0, 4));
  const end = parseInt(overview.periodEnd.slice(0, 4));
  if (!start || !end) return [];
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

function YearSelector({
  years,
  selectedYear,
  onChange,
}: {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number | null) => void;
}) {
  return (
    <div className="container mx-auto mb-6 sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-3 -mx-4 px-4 rounded-b-lg border-b border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-gray-600">Filtrar por ano:</span>
        <button
          onClick={() => onChange(null)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === null
              ? "bg-ameciclo text-white"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
        >
          Todo o período
        </button>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === year
                ? "bg-ameciclo text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
          >
            {year}
          </button>
        ))}
      </div>
      {selectedYear && (
        <p className="text-center text-xs text-gray-400 mt-2">
          Mostrando dados de {selectedYear}. Selecione "Todo o período" para ver dados agregados.
        </p>
      )}
    </div>
  );
}

export default function InfracoesClientSide({
  overview,
  violationCodes,
  categories,
}: InfracoesClientSideProps) {
  const totalViolations = overview.totalViolations;
  const availableYears = getAvailableYears(overview);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showViolationFilters, setShowViolationFilters] = useState(false);
  const [showStreetFilters, setShowStreetFilters] = useState(false);

  const dateParams = useCallback((): Record<string, string> => {
    if (selectedYear === null) return {
      start_date: overview.periodStart,
      end_date: overview.periodEnd,
    };
    return {
      start_date: `${selectedYear}-01-01`,
      end_date: `${selectedYear}-12-31`,
    };
  }, [selectedYear, overview.periodStart, overview.periodEnd]);

  // ─── Bloco 1: Onde Acontecem (ruas + mapa) ──────────────────────
  const dp = dateParams();
  const {
    data: streetsGeo,
    isLoading: loadingStreets,
    isError: streetsQueryError,
  } = useQuery(infracoesStreetsAndGeoQueryOptions(dp, categories));
  const streetsData = streetsGeo?.streetsData ?? [];
  const geojsonData = streetsGeo?.geojsonData ?? null;
  const streetsError = streetsQueryError || (!loadingStreets && streetsData.length === 0 && !geojsonData);

  // ─── Bloco 2: Quando Acontecem (temporal) ────────────────────────
  const {
    data: temporalData,
    isLoading: loadingTemporal,
  } = useQuery(infracoesTemporalQueryOptions(dp));

  // ─── Bloco 3: Quem Fiscaliza ─────────────────────────────────────
  const {
    data: agentData = [],
    isLoading: loadingAgents,
  } = useQuery(infracoesAgentsQueryOptions(dp));

  // ─── Bloco 4: Categorias top violations ──────────────────────────
  const {
    data: categoryTopViolations = {},
    isLoading: loadingCategories,
  } = useQuery({
    ...infracoesCategoryTopQueryOptions(dp, categories),
    enabled: categories.length > 0,
  });

  // ─── Dados de tabelas ────────────────────────────────────────────
  const streetTableData = streetsData.map((s: any, i: number) => {
    const tv = s.top_violation;
    return {
      ranking: i + 1,
      rua: s.official_name,
      bairro: s.neighborhood_name,
      total: s.total_violations?.toLocaleString("pt-BR"),
      total_raw: s.total_violations ?? 0,
      extensao_km: s.extension_km?.toFixed(1),
      infracoes_por_km: s.violations_per_km?.toFixed(0),
      mais_comum: tv ? `${tv.law_code} — ${tv.description}` : "—",
      pct_mais_comum: tv ? `${tv.percentage?.toFixed(1)}%` : "—",
    };
  });

  const violationTableData = violationCodes.map((v) => ({
    base_legal: v.lawCode,
    descricao: v.description,
    categoria: v.category || "Não classificada",
    quantidade: v.count.toLocaleString("pt-BR"),
    count_raw: v.count,
  }));

  const layersConf: LayerProps[] = useMemo(() => {
    const features = geojsonData?.features;
    if (!features?.length) return [];

    const values = features
      .map((f: any) => f.properties?.total_violations ?? 0)
      .filter((v: number) => v > 0)
      .sort((a: number, b: number) => a - b);

    const n = values.length;
    if (n === 0) return [];

    const q1 = values[Math.floor(n * 0.25)];
    const q2 = values[Math.floor(n * 0.50)];
    const q3 = values[Math.floor(n * 0.75)];

    return [{
      id: "infracoes-linhas",
      type: "line" as const,
      paint: {
        "line-color": [
          "interpolate",
          ["linear"],
          ["get", "total_violations"],
          0, "#FEF3C7",
          q1, "#F59E0B",
          q2, "#DC2626",
          q3, "#7F1D1D",
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "total_violations"],
          0, 2,
          q1, 3,
          q2, 5,
          q3, 8,
        ],
        "line-opacity": 0.7,
      },
      layout: {},
    }];
  }, [geojsonData]);

  return (
    <div className="pb-16">
      {availableYears.length > 0 && (
        <YearSelector
          years={availableYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 1 — Onde Acontecem
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Onde Acontecem"
        subtitle="As ruas com maior concentração de infrações no Recife, com a infração mais comum em cada via."
      >
        {loadingStreets ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : streetsError ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">API de infrações indisponível</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Verifique se o serviço em <code className="bg-gray-100 px-1 rounded">localhost:3013</code> está rodando.
            </p>
          </div>
        ) : (
          <>
            {geojsonData?.features?.length > 0 ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <AmecicloMap
                  layerData={geojsonData}
                  layersConf={layersConf}
                  height="450px"
                  showLayersPanel={false}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa não disponível</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Os dados geoespaciais não estão disponíveis para o período selecionado.
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg">
              <Table
                title="Ruas com mais infrações"
                data={streetTableData}
                showFilters={showStreetFilters}
                setShowFilters={setShowStreetFilters}
                columns={[
                  { Header: "#", accessor: "ranking", disableFilters: true, width: '5%' },
                  { Header: "Rua", accessor: "rua", width: '25%' },
                  { Header: "Total", accessor: "total", disableFilters: true, width: '15%' },
                  { Header: "Infração mais comum", accessor: "mais_comum", Filter: SelectColumnFilter, width: '40%' },
                  { Header: "% da via", accessor: "pct_mais_comum", disableFilters: true, width: '15%' },
                ]}
              />
            </div>
          </>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 2 — Quando Acontecem
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Quando Acontecem"
        subtitle="Distribuição temporal das infrações ao longo dos anos, meses, dias da semana e horas do dia."
      >
        {loadingTemporal ? (
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-60" />
              <Skeleton className="h-60" />
              <Skeleton className="h-60" />
            </div>
          </div>
        ) : temporalData ? (
          <>
            {temporalData.by_year && Object.keys(temporalData.by_year).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  Evolução Anual{selectedYear ? ` — ${selectedYear}` : ""}
                </h3>
                <VerticalBarChart
                  title=""
                  xAxisTitle=""
                  yAxisTitle="Infrações"
                  data={Object.entries(temporalData.by_year)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([year, count]) => ({ label: year, count: count as number }))}
                  xKey="label"
                  yKeys={["count"]}
                  colors={["#dc2626"]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {temporalData.by_month && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por mês</h4>
                  <VerticalBarChart
                    title=""
                    xAxisTitle=""
                    yAxisTitle=""
                    data={getAllMonthsData(temporalData.by_month)}
                    xKey="label"
                    yKeys={["count"]}
                    colors={["#3b82f6"]}
                  />
                </div>
              )}
              {temporalData.by_weekday && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por dia da semana</h4>
                  <VerticalBarChart
                    title=""
                    xAxisTitle=""
                    yAxisTitle=""
                    data={Object.entries(temporalData.by_weekday).map(
                      ([day, count]) => ({ label: WEEKDAY_LABELS[day] ?? day, count: count as number })
                    )}
                    xKey="label"
                    yKeys={["count"]}
                    colors={["#10b981"]}
                  />
                </div>
              )}
              {temporalData.by_hour && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Por hora do dia</h4>
                  <VerticalBarChart
                    title=""
                    xAxisTitle=""
                    yAxisTitle=""
                    data={Object.entries(temporalData.by_hour)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([hour, count]) => ({ label: `${hour}h`, count: count as number }))}
                    xKey="label"
                    yKeys={["count"]}
                    colors={["#8b5cf6"]}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Dados temporais não disponíveis.
          </div>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 3 — Quem Fiscaliza o Quê
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Quem Fiscaliza o Quê"
        subtitle="Os dados mostram o que foi fiscalizado, não necessariamente tudo que aconteceu. O perfil do agente revela o viés da base."
      >
        {loadingAgents ? (
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-60" />)}
            </div>
          </div>
        ) : agentData.length > 0 ? (
          <>
            <div className="mb-8">
              <HorizontalBarChart
                title="Percentual por tipo de agente"
                yAxisTitle="% das autuações"
                series={[{
                  name: "Percentual",
                  data: agentData.map((a: any) => ({ name: a.description, y: a.percentage })),
                  color: "#dc2626",
                }]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agentData.map((agent: any) => (
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
                        {agent.top_violations.slice(0, 5).map((v: any) => (
                          <li key={v.violation_code} className="text-sm text-gray-700 flex justify-between">
                            <span className="truncate mr-2">{v.law_code} — {v.description}</span>
                            <span className="font-semibold shrink-0">{v.count?.toLocaleString("pt-BR")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Dados de agentes não disponíveis.
          </div>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 4 — Categorias de Segurança
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Infrações por classificação"
        subtitle="As infrações são agrupadas por classificação temática. Clique em um card para ver a análise aprofundada de cada categoria."
      >
        {categories.length === 0 ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {categories.map((cat) => {
                const pct = totalViolations > 0 ? ((cat.totalViolations / totalViolations) * 100).toFixed(1) : "0.0";
                const color = CATEGORY_COLORS[cat.name] ?? "#9ca3af";
                const topCodes = categoryTopViolations[cat.name] ?? [];
                return (
                  <Link
                    key={cat.name}
                    to="/dados/infracoes/$category"
                    params={{ category: categoryToSlug(cat.name) }}
                    className="bg-white rounded-lg shadow-lg p-6 flex flex-col hover:shadow-xl hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
                    </div>
                    <div className="mb-4">
                      <p className="text-3xl font-bold" style={{ color }}>{cat.totalViolations.toLocaleString("pt-BR")}</p>
                      <p className="text-sm text-gray-500">{pct}% da base — {cat.codeCount} artigos</p>
                    </div>
                    {loadingCategories ? (
                      <div className="space-y-2 mt-auto">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ) : topCodes.length > 0 ? (
                      <div className="mt-auto">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top infrações</p>
                        <ul className="space-y-1">
                          {topCodes.slice(0, 5).map((v: any) => (
                            <li key={v.violation_code} className="text-sm text-gray-700 flex justify-between">
                              <span className="truncate mr-2">{v.law_code} — {v.description}</span>
                              <span className="font-semibold shrink-0">{v.count?.toLocaleString("pt-BR")}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-auto">Nenhuma infração registrada</p>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Distribuição por Categoria</h3>
              <div className="flex flex-wrap gap-3 justify-center mb-4">
                {categories.map((cat) => {
                  const pct = totalViolations > 0 ? ((cat.totalViolations / totalViolations) * 100).toFixed(1) : "0.0";
                  const color = CATEGORY_COLORS[cat.name] ?? "#9ca3af";
                  return (
                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-gray-600">{cat.name}</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex h-6 rounded-md overflow-hidden">
                {categories.map((cat) => {
                  const pct = totalViolations > 0 ? (cat.totalViolations / totalViolations) * 100 : 0;
                  if (pct < 0.5) return null;
                  return (
                    <div key={cat.name} className="h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLORS[cat.name] ?? "#9ca3af",
                        minWidth: pct > 1 ? "auto" : "0",
                      }}
                      title={`${cat.name}: ${cat.totalViolations.toLocaleString("pt-BR")}`}
                    >
                      {pct > 5 ? `${Math.round(pct)}%` : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 5 — Tabela Completa
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg shadow-lg">
        <Table
          title="Infrações registradas"
          data={violationTableData}
          showFilters={showViolationFilters}
          setShowFilters={setShowViolationFilters}
          columns={[
            { Header: "Base Legal", accessor: "base_legal", width: '15%' },
            { Header: "Descrição", accessor: "descricao", width: '45%' },
            { Header: "Categoria", accessor: "categoria", Filter: SelectColumnFilter, width: '25%' },
            { Header: "Quantidade", accessor: "quantidade", disableFilters: true, width: '15%' },
          ]}
        />
      </div>
    </div>
  );
}
