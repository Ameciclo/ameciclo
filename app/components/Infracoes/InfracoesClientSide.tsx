"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";
import { VerticalBarChart } from "~/components/Charts/VerticalBarChart";
import Table from "~/components/Commom/Table/Table";
import { CollapsibleTable } from "~/components/Commom/Table/CollapsibleTable";
import { SelectColumnFilter } from "~/components/Commom/Table/TableFilters";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import type { LayerProps } from "react-map-gl/maplibre";
import {
  infracoesGeoJSONQueryOptions,
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

const CATEGORY_COLOR_PALETTE = [
  "#dc2626", "#f59e0b", "#06b6d4", "#8b5cf6",
  "#3b82f6", "#10b981", "#6b7280", "#ec4899",
  "#f97316", "#14b8a6", "#6366f1", "#84cc16",
];

function getCategoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return CATEGORY_COLOR_PALETTE[Math.abs(hash) % CATEGORY_COLOR_PALETTE.length];
}

export function categoryColor(name: string): string {
  return getCategoryColor(name);
}

export function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToCategory(slug: string, categories?: string[]): string {
  if (categories?.length) {
    const match = categories.find((c) => categoryToSlug(c) === slug);
    if (match) return match;
  }
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  temporal: { by_year: Record<string, number>; by_month_raw: any[]; by_weekday_raw: any[]; by_hour_raw: any[] };
  categoryBreakdown: Array<{ category: string; total: number; percentage: number; topViolations: any[] }>;
  agentBreakdownByYear: any[];
  categoryBreakdownByYear: any[];
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
  children,
}: {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number | null) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto mb-6 sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-3 px-4 rounded-b-lg border-b border-gray-200 shadow-sm">
      {/* Desktop: pill buttons */}
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
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

      {/* Mobile: dropdown */}
      <div className="sm:hidden flex items-center justify-center gap-2">
        <label className="text-sm font-medium text-gray-600 shrink-0">Ano:</label>
        <select
          value={selectedYear ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full max-w-48 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-ameciclo"
        >
          <option value="">Todo o período</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {children}
    </div>
  );
}

export default function InfracoesClientSide({
  overview,
  violationCodes,
  categories,
  temporal = { by_year: {}, by_month_raw: [], by_weekday_raw: [], by_hour_raw: [] },
  categoryBreakdown = [],
  agentBreakdownByYear = [],
  categoryBreakdownByYear = [],
}: InfracoesClientSideProps) {
  const availableYears = getAvailableYears(overview);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showViolationFilters, setShowViolationFilters] = useState(false);
  const [showStreetFilters, setShowStreetFilters] = useState(false);

  // ─── Bloco 1: Onde Acontecem (ruas + mapa) ──────────────────────
  const {
    data: geoData,
    isFetching: loadingGeo,
  } = useQuery(infracoesGeoJSONQueryOptions({}));

  const { geojsonData, streetsData } = useMemo(() => {
    const features = geoData?.features ?? [];
    if (selectedYear === null) {
      return {
        geojsonData: geoData,
        streetsData: features.map((f: any) => f.properties ?? {}),
      };
    }
    const yearStr = String(selectedYear);
    const mapped = features
      .map((f: any) => {
        const props = f.properties ?? {};
        const yearCount = props.by_year?.[yearStr] ?? 0;
        return {
          ...f,
          properties: {
            ...props,
            total_violations: yearCount,
            violations_per_km: props.extension_km ? yearCount / props.extension_km : 0,
          },
        };
      })
      .filter((f: any) => f.properties.total_violations > 0);
    return {
      geojsonData: mapped.length > 0 ? { ...geoData, features: mapped } : null,
      streetsData: mapped.map((f: any) => f.properties),
    };
  }, [geoData, selectedYear]);

  // ─── Bloco 2: Temporal ── by_year pre-aggregated, detail filtered client-side
  const temporalData = useMemo(() => {
    const year = selectedYear;
    const monthFilter = year !== null
      ? (temporal.by_month_raw ?? []).filter((m: any) => m.year === year)
      : (temporal.by_month_raw ?? []);
    const byMonth: Record<string, number> = {};
    for (const m of monthFilter) {
      const key = String(m.month).padStart(2, "0");
      byMonth[key] = (byMonth[key] ?? 0) + (m.count ?? 0);
    }

    const weekdayFilter = year !== null
      ? (temporal.by_weekday_raw ?? []).filter((w: any) => w.year === year)
      : (temporal.by_weekday_raw ?? []);
    const wl = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    const byWeekday: Record<string, number> = {};
    for (const w of weekdayFilter) {
      const c = w.counts ?? [];
      for (let i = 0; i < Math.min(c.length, 7); i++) {
        byWeekday[wl[i]] = (byWeekday[wl[i]] ?? 0) + (c[i] ?? 0);
      }
    }

    const hourFilter = year !== null
      ? (temporal.by_hour_raw ?? []).filter((h: any) => h.year === year)
      : (temporal.by_hour_raw ?? []);
    const byHour: Record<string, number> = {};
    for (const h of hourFilter) {
      const c = h.counts ?? [];
      for (let i = 0; i < Math.min(c.length, 24); i++) {
        byHour[String(i)] = (byHour[String(i)] ?? 0) + (c[i] ?? 0);
      }
    }

    return {
      by_year: temporal?.by_year ?? {},
      by_month: byMonth,
      by_weekday: byWeekday,
      by_hour: byHour,
    };
  }, [temporal, selectedYear]);

  // ─── Bloco 3: Agentes ─── full range or filtered by year
  const agentData = useMemo(() => {
    if (selectedYear === null) return overview.agentBreakdown ?? [];
    const yearEntry = agentBreakdownByYear.find((e: any) => e.year === selectedYear);
    return yearEntry?.agents ?? overview.agentBreakdown ?? [];
  }, [selectedYear, overview.agentBreakdown, agentBreakdownByYear]);

  // ─── Bloco 4: Categories ─── full range or filtered by year
  const { categoryTopViolations, effectiveCategories } = useMemo(() => {
    const topViolations: Record<string, any[]> = {};
    const totals: Record<string, { totalViolations: number }> = {};

    if (selectedYear === null) {
      for (const cat of categoryBreakdown) {
        topViolations[cat.category] = cat.topViolations ?? [];
        totals[cat.category] = { totalViolations: cat.total };
      }
    } else {
      const yearEntry = categoryBreakdownByYear.find((e: any) => e.year === selectedYear);
      const cats = yearEntry?.categories ?? categoryBreakdown;
      for (const cat of cats) {
        topViolations[cat.category] = cat.top_violations ?? [];
        totals[cat.category] = { totalViolations: cat.count ?? 0 };
      }
    }

    const effCats = Object.keys(totals).length > 0
      ? categories.map((cat) => {
          const t = totals[cat.name];
          return t ? { ...cat, totalViolations: t.totalViolations } : cat;
        })
      : categories;

    return { categoryTopViolations: topViolations, effectiveCategories: effCats };
  }, [selectedYear, categoryBreakdown, categoryBreakdownByYear, categories]);

  const effectiveTotalViolations = useMemo(() => {
    return effectiveCategories.reduce((sum, cat) => sum + cat.totalViolations, 0);
  }, [effectiveCategories]);

  // ─── Dados de tabelas ────────────────────────────────────────────
  const streetsSorted = [...streetsData]
    .filter((s: any) => s.total_violations > 0)
    .sort((a: any, b: any) => (b.total_violations ?? 0) - (a.total_violations ?? 0))
    .slice(0, 100);

  const totalStreetViolations = streetsSorted.reduce((sum: number, s: any) => sum + (s.total_violations ?? 0), 0);

  const streetTableData = streetsSorted.map((s: any, i: number) => {
    const name = s.street_name ?? s.official_name ?? "";
    const ruaSlug = name
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const total = s.total_violations ?? 0;
    const tv = s.top_violation;
    return {
      ranking: i + 1,
      rua: name,
      rua_slug: ruaSlug,
      street_code: s.street_code,
      total_raw: total,
      extensao_km: s.extension_km?.toFixed(1) ?? "—",
      pct_total: totalStreetViolations > 0 ? `${((total / totalStreetViolations) * 100).toFixed(1)}%` : "—",
      principal_infracao: tv?.description ?? "—",
      pct_via: tv?.percentage != null ? `${tv.percentage.toFixed(1)}%` : "—",
    };
  });

  const violationTableData = violationCodes.map((v) => ({
    base_legal: v.lawCode,
    descricao: v.description,
    categoria: v.category || "Não classificada",
    count_raw: v.count,
  }));

  const colorBreakpoints = { r1: 5000, r2: 10000, r3: 15000 };

  const layersConf: LayerProps[] = useMemo(() => {
    const { r1, r2, r3 } = colorBreakpoints;

    return [{
      id: "infracoes-linhas",
      type: "line" as const,
      paint: {
        "line-color": [
          "interpolate",
          ["linear"],
          ["get", "total_violations"],
          0, "#FEF3C7",
          r1, "#F59E0B",
          r2, "#DC2626",
          r3, "#7F1D1D",
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "total_violations"],
          0, 2,
          r1, 3,
          r2, 5,
          r3, 8,
        ],
        "line-opacity": 0.7,
      },
      layout: {},
    }];
  }, []);

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

  return (
    <div className="pb-16">
      {availableYears.length > 0 && (
        <YearSelector
          years={availableYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        >
          {selectedYear && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Mostrando dados de {selectedYear}. Selecione "Todo o período" para ver dados agregados.
            </p>
          )}
        </YearSelector>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 1 — Onde Acontecem
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title={`Onde Acontecem${selectedYear ? ` — ${selectedYear}` : ""}`}
        subtitle="As ruas com maior concentração de infrações no Recife, com a infração mais comum em cada via."
      >
        <div className={`transition-opacity duration-150 ${loadingGeo ? 'opacity-60' : ''}`}>
          {geojsonData?.features?.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 relative">
              <AmecicloMap
                layerData={geojsonData}
                layersConf={layersConf}
                height="450px"
                showLayersPanel={false}
              />
              {mapLegend}
            </div>
          ) : (geoData && !loadingGeo) ? (
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
          ) : null}

          {streetsData.length > 0 && (
            <CollapsibleTable
              title="Ruas com mais infrações"
              subtitle={`Top ${streetTableData.length} vias${selectedYear ? ` em ${selectedYear}` : ""}`}
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
          )}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 2 — Quando Acontecem
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title={`Quando Acontecem${selectedYear ? ` — ${selectedYear}` : ""}`}
        subtitle="Distribuição temporal das infrações ao longo dos anos, meses, dias da semana e horas do dia."
      >
        <div className="transition-opacity duration-150">
          {temporalData?.by_year && Object.keys(temporalData.by_year).length > 0 && (
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
                  .map(([year, count]) => ({ label: year, count }))}
                xKey="label"
                yKeys={["count"]}
                colorByLabel={selectedYear
                  ? (label: string) => label === String(selectedYear) ? '#dc2626' : '#d1d5db'
                  : () => '#dc2626'}
              />
            </div>
          )}

          {temporalData ? (
            <>
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
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 3 — Quem Fiscaliza o Quê
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title={`Quem Fiscaliza o Quê${selectedYear ? ` — ${selectedYear}` : ""}`}
        subtitle="Os dados mostram o que foi fiscalizado, não necessariamente tudo que aconteceu. O perfil do agente revela o viés da base."
      >
        <div className="transition-opacity duration-150">
          {agentData.length > 0 ? (
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
                      <p className="text-3xl font-bold text-ameciclo">{agent.count?.toLocaleString("pt-BR")}</p>
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
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Dados de agentes não disponíveis.
            </div>
          )}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 4 — Categorias de Segurança
          ═══════════════════════════════════════════════════════════════ */}
      <Section
        title={`Infrações por classificação${selectedYear ? ` — ${selectedYear}` : ""}`}
        subtitle="As infrações são agrupadas por classificação temática. Clique em um card para ver a análise aprofundada de cada categoria."
      >
        <div className="transition-opacity duration-150">
          {effectiveCategories.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {effectiveCategories.map((cat) => {
                  const pct = effectiveTotalViolations > 0 ? ((cat.totalViolations / effectiveTotalViolations) * 100).toFixed(1) : "0.0";
                  const color = getCategoryColor(cat.name);
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
                      {topCodes.length > 0 ? (
                        <div className="mt-auto">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top infrações</p>
                          <ul className="space-y-1">
                            {topCodes.slice(0, 5).map((v: any, i: number) => (
                              <li key={`${v.law_code}-${i}`} className="text-sm text-gray-700 flex justify-between">
                                <span className="truncate mr-2">{v.law_code ? `${v.law_code} — ` : ""}{v.description}</span>
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
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{`Distribuição por Categoria${selectedYear ? ` — ${selectedYear}` : ""}`}</h3>
                <div className="flex flex-wrap gap-3 justify-center mb-4">
                  {effectiveCategories.map((cat) => {
                    const pct = effectiveTotalViolations > 0 ? ((cat.totalViolations / effectiveTotalViolations) * 100).toFixed(1) : "0.0";
                    const color = getCategoryColor(cat.name);
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
                  {effectiveCategories.map((cat) => {
                    const pct = effectiveTotalViolations > 0 ? (cat.totalViolations / effectiveTotalViolations) * 100 : 0;
                    if (pct < 0.5) return null;
                    return (
                      <div key={cat.name} className="h-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: getCategoryColor(cat.name),
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
        </div>
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
            { Header: "Base Legal", accessor: "base_legal", width: '15%', Cell: ({ value }: { value: string }) => value ? (
              <a href={`/dados/infracoes/lei/${encodeURIComponent(value)}`} className="text-teal-600 hover:underline">{value}</a>
            ) : "—" },
            { Header: "Descrição", accessor: "descricao", width: '40%' },
            { Header: "Categoria", accessor: "categoria", Filter: SelectColumnFilter, width: '25%' },
            { Header: "Quantidade", accessor: "count_raw", disableFilters: true, width: '15%', Cell: ({ value }: { value: number }) => value.toLocaleString("pt-BR") },
          ]}
        />
      </div>
    </div>
  );
}
