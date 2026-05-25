"use client";

import { useState, useEffect, useCallback } from "react";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";
import { VerticalBarChart } from "~/components/Charts/VerticalBarChart";
import Table from "~/components/Commom/Table/Table";
import { SelectColumnFilter } from "~/components/Commom/Table/TableFilters";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import type { LayerProps } from "react-map-gl/maplibre";
import {
  TRAFFIC_VIOLATIONS_TOP,
  TRAFFIC_VIOLATIONS_TOP_STREETS,
  TRAFFIC_VIOLATIONS_TEMPORAL,
  TRAFFIC_VIOLATIONS_AGENT_ANALYSIS,
  TRAFFIC_VIOLATIONS_GEOJSON,
} from "~/servers";

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

function buildUrl(base: string, params: Record<string, string>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedYear === null
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

  const dateParams = useCallback((): Record<string, string> => {
    if (selectedYear === null) return {};
    return {
      start_date: `${selectedYear}-01-01`,
      end_date: `${selectedYear}-12-31`,
    };
  }, [selectedYear]);

  // ─── Bloco 1: Onde Acontecem (ruas + mapa) ──────────────────────
  const [streetsData, setStreetsData] = useState<any[]>([]);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [loadingStreets, setLoadingStreets] = useState(true);
  const [streetsError, setStreetsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const dp = dateParams();
    setLoadingStreets(true);
    Promise.all([
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP_STREETS, { ...dp, limit: "100" })).catch((e) => { console.error("Falha top-streets:", e); return { streets: [] }; }),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_GEOJSON, { ...dp, limit: "500" })).catch((e) => { console.error("Falha geojson:", e); return null; }),
    ])
      .then(([streets, geo]) => {
        if (cancelled) return;
        setStreetsData(streets.streets ?? []);
        setGeojsonData(geo ?? null);
        setStreetsError(!streets.streets?.length && !geo);
      })
      .catch((err) => console.error("Erro ruas/mapa:", err))
      .finally(() => { if (!cancelled) setLoadingStreets(false); });
    return () => { cancelled = true; };
  }, [selectedYear, dateParams]);

  // ─── Bloco 2: Quando Acontecem (temporal) ────────────────────────
  const [temporalData, setTemporalData] = useState<any>(null);
  const [loadingTemporal, setLoadingTemporal] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const dp = dateParams();
    setLoadingTemporal(true);
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TEMPORAL, dp))
      .then((data) => { if (!cancelled) setTemporalData(data); })
      .catch((err) => console.error("Erro temporal:", err))
      .finally(() => { if (!cancelled) setLoadingTemporal(false); });
    return () => { cancelled = true; };
  }, [selectedYear, dateParams]);

  // ─── Bloco 3: Quem Fiscaliza ─────────────────────────────────────
  const [agentData, setAgentData] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const dp = dateParams();
    setLoadingAgents(true);
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_AGENT_ANALYSIS, dp))
      .then((data) => { if (!cancelled) setAgentData(data.agents ?? []); })
      .catch((err) => console.error("Erro agentes:", err))
      .finally(() => { if (!cancelled) setLoadingAgents(false); });
    return () => { cancelled = true; };
  }, [selectedYear, dateParams]);

  // ─── Bloco 4: Categorias top violations ──────────────────────────
  const [categoryTopViolations, setCategoryTopViolations] = useState<Record<string, any[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (categories.length === 0) return;
    let cancelled = false;
    const dp = dateParams();
    setLoadingCategories(true);
    Promise.all(
      categories
        .filter((c) => c.name !== "Outras/não classificadas")
        .map(async (cat) => {
          try {
            const data = await fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP, { ...dp, category: cat.name, limit: "5" }));
            return { key: cat.name, violations: data.violations ?? [] };
          } catch {
            return { key: cat.name, violations: [] };
          }
        })
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, any[]> = {};
        for (const r of results) map[r.key] = r.violations;
        setCategoryTopViolations(map);
      })
      .catch((err) => console.error("Erro categorias:", err))
      .finally(() => { if (!cancelled) setLoadingCategories(false); });
    return () => { cancelled = true; };
  }, [categories, selectedYear, dateParams]);

  // ─── Bloco 5: Pedestres ──────────────────────────────────────────
  const [pedestresData, setPedestresData] = useState<any>(null);
  const [loadingPedestres, setLoadingPedestres] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const dp = dateParams();
    setLoadingPedestres(true);
    Promise.all([
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP, { ...dp, category: "Pedestres", limit: "10" })).catch(() => ({ violations: [] })),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP_STREETS, { ...dp, category: "Pedestres", limit: "10" })).catch(() => ({ streets: [] })),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TEMPORAL, { ...dp, category: "Pedestres" })).catch(() => ({})),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_AGENT_ANALYSIS, { ...dp, category: "Pedestres" })).catch(() => ({ agents: [] })),
    ])
      .then(([topV, topS, temporal, agents]) => {
        if (cancelled) return;
        setPedestresData({
          topViolations: topV.violations ?? [],
          topStreets: topS.streets ?? [],
          temporal: temporal ?? {},
          agentAnalysis: agents.agents ?? [],
        });
      })
      .catch((err) => console.error("Erro pedestres:", err))
      .finally(() => { if (!cancelled) setLoadingPedestres(false); });
    return () => { cancelled = true; };
  }, [selectedYear, dateParams]);

  // ─── Bloco 6: Ciclistas ──────────────────────────────────────────
  const [ciclistasData, setCiclistasData] = useState<any>(null);
  const [loadingCiclistas, setLoadingCiclistas] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const dp = dateParams();
    setLoadingCiclistas(true);
    Promise.all([
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP, { ...dp, category: "Ciclistas", limit: "10" })).catch(() => ({ violations: [] })),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP_STREETS, { ...dp, category: "Ciclistas", limit: "10" })).catch(() => ({ streets: [] })),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TEMPORAL, { ...dp, category: "Ciclistas" })).catch(() => ({})),
      fetchJson(buildUrl(TRAFFIC_VIOLATIONS_AGENT_ANALYSIS, { ...dp, category: "Ciclistas" })).catch(() => ({ agents: [] })),
    ])
      .then(([topV, topS, temporal, agents]) => {
        if (cancelled) return;
        setCiclistasData({
          topViolations: topV.violations ?? [],
          topStreets: topS.streets ?? [],
          temporal: temporal ?? {},
          agentAnalysis: agents.agents ?? [],
        });
      })
      .catch((err) => console.error("Erro ciclistas:", err))
      .finally(() => { if (!cancelled) setLoadingCiclistas(false); });
    return () => { cancelled = true; };
  }, [selectedYear, dateParams]);

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

  const layersConf: LayerProps[] = geojsonData?.features?.length > 0 ? [{
    id: "infracoes-pontos",
    type: "circle" as const,
    paint: {
      "circle-color": "#dc2626",
      "circle-opacity": 0.4,
      "circle-radius": 3,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 0.5,
    },
    layout: {},
  }] : [];

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
                <div className="p-4 border-b">
                  <h3 className="text-lg font-bold text-gray-800">
                    Mapa de Infrações
                  </h3>
                  <p className="text-sm text-gray-500">
                    Cada ponto representa uma infração registrada.{selectedYear ? ` Ano: ${selectedYear}` : ""}
                  </p>
                </div>
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
                title={`Top ${streetsData.length} Ruas com Mais Infrações`}
                data={streetTableData}
                columns={[
                  { Header: "#", accessor: "ranking", disableFilters: true },
                  { Header: "Rua", accessor: "rua", disableFilters: true },
                  { Header: "Bairro", accessor: "bairro", disableFilters: true },
                  { Header: "Total", accessor: "total", disableFilters: true },
                  { Header: "Extensão (km)", accessor: "extensao_km", disableFilters: true },
                  { Header: "Infrações/km", accessor: "infracoes_por_km", disableFilters: true },
                  { Header: "Infração mais comum", accessor: "mais_comum", disableFilters: true },
                  { Header: "% da via", accessor: "pct_mais_comum", disableFilters: true },
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
        title="Segurança Viária × Fluidez × Estacionamento"
        subtitle="Classificação das infrações por categoria, respondendo: quantas estão ligadas à segurança da vida e quantas são mais ligadas a fluidez ou estacionamento?"
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
                  <div key={cat.name} className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
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
                  </div>
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
          BLOCO 5 — Pedestres
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Pedestres"
        subtitle="Infrações que protegem quem anda a pé. Esses dados aparecem na fiscalização ou são invisíveis?"
      >
        {loadingPedestres ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-80" />
          </div>
        ) : pedestresData ? (
          <ViolationsCategorySection data={pedestresData} totalViolations={totalViolations} color="#f59e0b" label="pedestres" />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">Dados de pedestres não disponíveis.</div>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 6 — Ciclistas
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Ciclistas"
        subtitle="Infrações que protegem quem usa bicicleta. A fiscalização registra essas violações?"
      >
        {loadingCiclistas ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-80" />
          </div>
        ) : ciclistasData ? (
          <ViolationsCategorySection data={ciclistasData} totalViolations={totalViolations} color="#06b6d4" label="ciclistas" />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">Dados de ciclistas não disponíveis.</div>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 7 — Tabela Completa
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title="Lista Completa de Infrações"
        subtitle={`Todos os ${violationCodes.length} artigos do CTB registrados no Recife, com base legal, descrição, categoria e quantidade.`}
      >
        <div className="bg-white rounded-lg shadow-lg">
          <Table
            title=""
            data={violationTableData}
            showFilters={showViolationFilters}
            setShowFilters={setShowViolationFilters}
            columns={[
              { Header: "Base Legal", accessor: "base_legal" },
              { Header: "Descrição", accessor: "descricao" },
              { Header: "Categoria", accessor: "categoria", Filter: SelectColumnFilter },
              { Header: "Quantidade", accessor: "quantidade", disableFilters: true },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}

function ViolationsCategorySection({
  data, totalViolations, color, label,
}: {
  data: any; totalViolations: number; color: string; label: string;
}) {
  const categoryTotal = data.topViolations.reduce((s: number, v: any) => s + v.count, 0);
  const pct = totalViolations > 0 ? ((categoryTotal / totalViolations) * 100).toFixed(1) : "0.0";
  const mainAgent = data.agentAnalysis.length > 0 ? data.agentAnalysis[0] : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center" style={{ borderTop: `4px solid ${color}` }}>
          <p className="text-sm uppercase tracking-wider text-gray-500">Total</p>
          <p className="text-4xl font-bold mt-2" style={{ color }}>{categoryTotal.toLocaleString("pt-BR")}</p>
          <p className="text-xs mt-1 text-gray-500">{pct}% da base</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500">Artigos do CTB</p>
          <p className="text-4xl font-bold mt-2 text-ameciclo">{data.topViolations.length}</p>
          <p className="text-xs mt-1 text-gray-500">no top 10</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500">Ruas (top 10)</p>
          <p className="text-4xl font-bold mt-2 text-ameciclo">{data.topStreets.filter((s: any) => s.total_violations > 0).length}</p>
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

      {data.topViolations.length > 0 && (
        <HorizontalBarChart
          title={`Top 10 — Infrações relacionadas a ${label}`}
          yAxisTitle="Infrações"
          series={[{
            name: "Infrações",
            data: data.topViolations.map((v: any) => ({ name: `${v.law_code} — ${v.description}`, y: v.count })),
            color,
          }]}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ruas com mais registros</h3>
          {data.topStreets.length > 0 ? (
            <ul className="space-y-3">
              {data.topStreets.map((s: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{s.official_name}</span>
                  <span className="font-semibold text-gray-900 shrink-0">{s.total_violations?.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Evolução mensal</h3>
          {data.temporal?.by_month ? (
            <VerticalBarChart
              title="" xAxisTitle="" yAxisTitle=""
              data={getAllMonthsData(data.temporal.by_month)}
              xKey="label" yKeys={["count"]} colors={[color]}
            />
          ) : (
            <Skeleton className="h-60 w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
