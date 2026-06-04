import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  TRAFFIC_VIOLATIONS_OVERVIEW,
  TRAFFIC_VIOLATIONS_CODES,
  TRAFFIC_VIOLATIONS_CATEGORIES,
  TRAFFIC_VIOLATIONS_TOP,
  TRAFFIC_VIOLATIONS_TOP_STREETS,
  TRAFFIC_VIOLATIONS_TEMPORAL,
  TRAFFIC_VIOLATIONS_AGENT_ANALYSIS,
  TRAFFIC_VIOLATIONS_GEOJSON,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";

const fetchInfracoesInitial = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [overviewRaw, codesRaw, categoriesRaw] = await Promise.all([
    cmsFetch<any>(TRAFFIC_VIOLATIONS_OVERVIEW, {
      ttl: 300,
      timeout: 10000,
      fallback: null,
      onError: tracker.at(TRAFFIC_VIOLATIONS_OVERVIEW),
    }),
    cmsFetch<any>(TRAFFIC_VIOLATIONS_CODES, {
      ttl: 600,
      timeout: 10000,
      fallback: null,
      onError: tracker.at(TRAFFIC_VIOLATIONS_CODES),
    }),
    cmsFetch<any>(TRAFFIC_VIOLATIONS_CATEGORIES, {
      ttl: 600,
      timeout: 10000,
      fallback: null,
      onError: tracker.at(TRAFFIC_VIOLATIONS_CATEGORIES),
    }),
  ]);

  if (!overviewRaw || !codesRaw) {
    throw new Error(
      "Não foi possível carregar os dados de infrações de trânsito. " +
      "Verifique se o serviço de backend está disponível e tente novamente."
    );
  }

  const overview = {
    totalViolations: overviewRaw.total_violations ?? 0,
    periodStart: overviewRaw.period_start ?? "",
    periodEnd: overviewRaw.period_end ?? "",
    violationTypesCount: overviewRaw.violation_types_count ?? 0,
    lawCodesCount: overviewRaw.law_codes_count ?? 0,
    streetsCount: overviewRaw.streets_count ?? 0,
    neighborhoodsCount: overviewRaw.neighborhoods_count ?? 0,
    agentBreakdown: (overviewRaw.agent_breakdown ?? []).map((a: any) => ({
      agentId: a.agent_id,
      description: a.description ?? "",
      count: a.count ?? 0,
      percentage: a.percentage ?? 0,
      category: a.category ?? "manual",
    })),
  };

  const electronicPct = overview.agentBreakdown
    .filter((a: any) => a.category === "eletronico")
    .reduce((sum: number, a: any) => sum + a.percentage, 0);

  const violationCodes = (codesRaw.codes ?? []).map((c: any) => ({
    code: c.violation_code ?? "",
    lawCode: c.law_code ?? "",
    description: c.description ?? "",
    count: c.count ?? 0,
    category: c.category ?? "",
  }));

  const categories = (categoriesRaw?.categories ?? []).map((c: any) => ({
    name: c.category ?? "",
    codeCount: c.code_count ?? 0,
    totalViolations: c.total_violations ?? 0,
  }));

  const statisticsBoxes = [
    {
      title: "Total de infrações",
      value: overview.totalViolations.toLocaleString("pt-BR"),
      unit: `${overview.periodStart} a ${overview.periodEnd}`,
    },
    {
      title: "Tipos de infração",
      value: overview.violationTypesCount.toLocaleString("pt-BR"),
      unit: `${overview.lawCodesCount} artigos do CTB`,
    },
    {
      title: "Ruas com registros",
      value: overview.streetsCount.toLocaleString("pt-BR"),
      unit: "logradouros",
    },
    {
      title: "Fiscalização eletrônica",
      value: `${electronicPct.toFixed(1)}%`,
      unit: "das autuações",
    },
  ];

  return {
    overview,
    violationCodes,
    categories,
    statisticsBoxes,
    ...tracker.summary(),
  };
});

export const infracoesQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "infracoes"],
    queryFn: () => fetchInfracoesInitial(),
  });

// ─── Client-side query helpers (localhost APIs, not server functions) ──────

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

interface CategoryItem {
  name: string;
  codeCount: number;
  totalViolations: number;
}

// ─── Streets + GeoJSON ──────────────────────────────────────────────

async function fetchInfracoesStreetsAndGeo(
  params: Record<string, string>,
  categories: CategoryItem[],
) {
  const streetFetches = categories.length > 0
    ? categories
      .filter((c) => c.name !== "Outras/não classificadas")
      .map((cat) =>
        fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP_STREETS, { ...params, category: cat.name, limit: "25" }))
          .catch((e) => { console.error(`Falha top-streets (${cat.name}):`, e); return { streets: [] }; })
      )
    : [fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP_STREETS, { ...params, limit: "100" }))
        .catch((e) => { console.error("Falha top-streets:", e); return { streets: [] }; })];

  const results = await Promise.all([
    ...streetFetches,
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_GEOJSON, { ...params, limit: "100" })).catch((e) => { console.error("Falha geojson:", e); return null; }),
  ]);

  const geo = results[results.length - 1];
  const streetResults = results.slice(0, -1) as Array<{ streets: any[] }>;

  const streetMap = new Map<string, any>();
  for (const r of streetResults) {
    for (const s of r.streets ?? []) {
      const key = s.official_name;
      const existing = streetMap.get(key);
      if (existing) {
        existing.total_violations += s.total_violations ?? 0;
      } else {
        streetMap.set(key, { ...s });
      }
    }
  }
  const merged = Array.from(streetMap.values())
    .sort((a, b) => (b.total_violations ?? 0) - (a.total_violations ?? 0))
    .slice(0, 100);

  return { streetsData: merged, geojsonData: geo ?? null };
}

export const infracoesStreetsAndGeoQueryOptions = (
  params: Record<string, string>,
  categories: CategoryItem[],
) =>
  queryOptions({
    queryKey: ["infracoes", "streets-geo", params],
    queryFn: () => fetchInfracoesStreetsAndGeo(params, categories),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Temporal ───────────────────────────────────────────────────────

async function fetchInfracoesTemporal(params: Record<string, string>) {
  return fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TEMPORAL, params));
}

export const infracoesTemporalQueryOptions = (params: Record<string, string>) =>
  queryOptions({
    queryKey: ["infracoes", "temporal", params],
    queryFn: () => fetchInfracoesTemporal(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

export const infracoesTemporalCategoryQueryOptions = (
  params: Record<string, string>,
  categoryName: string,
) =>
  queryOptions({
    queryKey: ["infracoes", "temporal-category", categoryName, params],
    queryFn: () => fetchInfracoesTemporal({ ...params, category: categoryName }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Agent Analysis ─────────────────────────────────────────────────

async function fetchInfracoesAgents(params: Record<string, string>) {
  const data = await fetchJson(buildUrl(TRAFFIC_VIOLATIONS_AGENT_ANALYSIS, params));
  return data.agents ?? [];
}

export const infracoesAgentsQueryOptions = (params: Record<string, string>) =>
  queryOptions({
    queryKey: ["infracoes", "agents", params],
    queryFn: () => fetchInfracoesAgents(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Category Top Violations ────────────────────────────────────────

interface CategoryTopResult {
  topViolations: Record<string, any[]>;
  categoryTotals: Record<string, { totalViolations: number; codeCount: number }>;
}

async function fetchInfracoesCategoryTop(
  params: Record<string, string>,
  categories: CategoryItem[],
): Promise<CategoryTopResult> {
  const results = await Promise.all(
    categories
      .filter((c) => c.name !== "Outras/não classificadas")
      .map(async (cat) => {
        try {
          const data = await fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP, { ...params, category: cat.name, limit: "5" }));
          return {
            key: cat.name,
            violations: data.violations ?? [],
            total: data.total ?? 0,
            violationsCount: data.violations_count ?? 0,
          };
        } catch {
          return { key: cat.name, violations: [], total: 0, violationsCount: 0 };
        }
      })
  );

  const topViolations: Record<string, any[]> = {};
  const categoryTotals: Record<string, { totalViolations: number; codeCount: number }> = {};

  for (const r of results) {
    topViolations[r.key] = r.violations;
    categoryTotals[r.key] = { totalViolations: r.total, codeCount: r.violationsCount };
  }

  return { topViolations, categoryTotals };
}

export const infracoesCategoryTopQueryOptions = (
  params: Record<string, string>,
  categories: CategoryItem[],
) =>
  queryOptions({
    queryKey: ["infracoes", "category-top", params],
    queryFn: () => fetchInfracoesCategoryTop(params, categories),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Category Page Data (single category) ─────────────────────────

interface CategoryPageData {
  topViolations: any[];
  topStreets: any[];
  temporal: any;
  agentAnalysis: any[];
  geojson: any;
}

async function fetchInfracoesCategoryPage(
  params: Record<string, string>,
  categoryName: string,
): Promise<CategoryPageData> {
  const [topV, topS, temporal, agents, geo] = await Promise.all([
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP, { ...params, category: categoryName, limit: "20" }))
      .catch(() => ({ violations: [] })),
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TOP_STREETS, { ...params, category: categoryName, limit: "20" }))
      .catch(() => ({ streets: [] })),
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TEMPORAL, { ...params, category: categoryName }))
      .catch(() => ({})),
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_AGENT_ANALYSIS, { ...params, category: categoryName }))
      .catch(() => ({ agents: [] })),
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_GEOJSON, { ...params, category: categoryName, limit: "100" }))
      .catch(() => null),
  ]);

  return {
    topViolations: (topV as any).violations ?? [],
    topStreets: (topS as any).streets ?? [],
    temporal: temporal ?? {},
    agentAnalysis: (agents as any).agents ?? [],
    geojson: geo,
  };
}

export const infracoesCategoryPageQueryOptions = (
  params: Record<string, string>,
  categoryName: string,
) =>
  queryOptions({
    queryKey: ["infracoes", "category-page", categoryName, params],
    queryFn: () => fetchInfracoesCategoryPage(params, categoryName),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
