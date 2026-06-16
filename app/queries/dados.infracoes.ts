import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  TRAFFIC_VIOLATIONS_OVERVIEW,
  TRAFFIC_VIOLATIONS_CODES,
  TRAFFIC_VIOLATIONS_CATEGORIES,
  TRAFFIC_VIOLATIONS_TEMPORAL,
  TRAFFIC_VIOLATIONS_GEOJSON,
  TRAFFIC_VIOLATIONS_CATEGORY_PAGE,
  TRAFFIC_VIOLATIONS_LAW,
  TRAFFIC_VIOLATIONS_STREET,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";

const fetchInfracoesInitial = createServerFn().handler(async () => {
  try {
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

    const safeOverview = overviewRaw ?? {};
    const safeCodes = codesRaw ?? {};
    const safeCategories = categoriesRaw ?? {};

    const agentBreakdown = (safeOverview.agent_breakdown ?? []).map((a: any) => ({
      agentId: a.agent_id,
      description: a.description ?? "",
      count: a.count ?? 0,
      percentage: a.percentage ?? 0,
      category: a.category ?? "manual",
      top_violations: (a.top_violations ?? []).map((v: any) => ({
        law_code: v.law_code ?? "",
        description: v.description ?? "",
        count: v.count ?? 0,
      })),
    }));
    const overview = {
      totalViolations: safeOverview.total_violations ?? 0,
      periodStart: safeOverview.period_start ?? "",
      periodEnd: safeOverview.period_end ?? "",
      violationTypesCount: safeOverview.violation_types_count ?? 0,
      lawCodesCount: safeOverview.law_codes_count ?? 0,
      streetsCount: safeOverview.streets_count ?? 0,
      neighborhoodsCount: safeOverview.neighborhoods_count ?? 0,
      agentBreakdown,
    };

    const electronicPct = agentBreakdown
      .filter((a: any) => a.category === "eletronico")
      .reduce((sum: number, a: any) => sum + a.percentage, 0);

    const violationCodes = (safeCodes.codes ?? []).map((c: any) => ({
      code: c.violation_code ?? "",
      lawCode: c.law_code ?? "",
      description: c.description ?? "",
      count: c.count ?? 0,
      category: c.category ?? "",
    }));

    const categories = (safeCategories.categories ?? []).map((c: any) => ({
      name: c.category ?? "",
      codeCount: c.code_count ?? 0,
      totalViolations: c.total_violations ?? 0,
    }));

    // Temporal from overview.evolution — by_year pre-aggregated, others raw for client-side filtering
    const evo = safeOverview.evolution ?? {};
    const byYear: Record<string, number> = {};
    for (const item of evo.by_year ?? []) {
      if (item.year) byYear[String(item.year)] = item.count ?? 0;
    }
    const temporal = {
      by_year: byYear,
      by_month_raw: evo.by_month ?? [],
      by_weekday_raw: evo.by_weekday ?? [],
      by_hour_raw: evo.by_hour ?? [],
    };

    // Category breakdown from overview (replaces client-side /categories-detail)
    const categoryBreakdown = (safeOverview.category_breakdown ?? []).map((c: any) => ({
      category: c.category ?? "",
      total: c.count ?? 0,
      percentage: c.percentage ?? 0,
      topViolations: (c.top_violations ?? []).map((v: any) => ({
        law_code: v.law_code ?? "",
        description: v.description ?? "",
        count: v.count ?? 0,
      })),
    }));

    const fmtDate = (d: string) => {
      const parts = (d ?? "").slice(0, 10).split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
    };

    const monthCount = (() => {
      const s = overview.periodStart?.slice(0, 10);
      const e = overview.periodEnd?.slice(0, 10);
      if (!s || !e) return 1;
      const [sy, sm] = s.split("-").map(Number);
      const [ey, em] = e.split("-").map(Number);
      if (!sy || !ey) return 1;
      return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
    })();
    const monthlyAverage = Math.round(overview.totalViolations / monthCount);

    const statisticsBoxes = [
      {
        title: "Total de infrações",
        value: overview.totalViolations.toLocaleString("pt-BR"),
        unit: `${fmtDate(overview.periodStart)} a ${fmtDate(overview.periodEnd)}`,
      },
      {
        title: "Tipos de infração",
        value: overview.violationTypesCount.toLocaleString("pt-BR"),
        unit: `${overview.lawCodesCount} artigos do CTB`,
      },
      {
        title: "Média mensal",
        value: monthlyAverage.toLocaleString("pt-BR"),
        unit: `infrações/mês em ${monthCount} meses`,
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
      temporal,
      categoryBreakdown,
      agentBreakdownByYear: safeOverview.agent_breakdown_by_year ?? [],
      categoryBreakdownByYear: safeOverview.category_breakdown_by_year ?? [],
      ...tracker.summary(),
    };
  } catch (e) {
    console.error("fetchInfracoesInitial failed:", e);
    return {
      overview: {
        totalViolations: 0, periodStart: "", periodEnd: "",
        violationTypesCount: 0, lawCodesCount: 0, streetsCount: 0, neighborhoodsCount: 0,
        agentBreakdown: [],
      },
      violationCodes: [],
      categories: [],
      statisticsBoxes: [],
      temporal: { by_year: {}, by_month_raw: [], by_weekday_raw: [], by_hour_raw: [] },
      categoryBreakdown: [],
      agentBreakdownByYear: [],
      categoryBreakdownByYear: [],
      apiDown: true,
      apiErrors: [{ url: "SSR", error: String(e) }],
    };
  }
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
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

// ─── GeoJSON (single call) ────────────────────────────────────────────

async function fetchGeoJSON(params: Record<string, string>) {
  const url = buildUrl(TRAFFIC_VIOLATIONS_GEOJSON, { ...params, limit: "100", simplify_tolerance: "0.0005" });
  return fetchJson(url).catch(() => null);
}

export const infracoesGeoJSONQueryOptions = (params: Record<string, string>) =>
  queryOptions({
    queryKey: ["infracoes", "geojson", params],
    queryFn: () => fetchGeoJSON(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Temporal ───────────────────────────────────────────────────────

async function fetchInfracoesTemporal(params: Record<string, string>) {
  return fetchJson(buildUrl(TRAFFIC_VIOLATIONS_TEMPORAL, params)).catch(() => null);
}

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

// ─── Category Page Data (single endpoint) ──────────────────────────

async function fetchCategoryPage(
  params: Record<string, string>,
  categoryName: string,
) {
  const slug = categoryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const [categoryData, geo] = await Promise.all([
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_CATEGORY_PAGE(slug), { ...params, limit: "20" }))
      .catch(() => null),
    fetchJson(buildUrl(TRAFFIC_VIOLATIONS_GEOJSON, { ...params, category: categoryName, limit: "100", simplify_tolerance: "0.0005" }))
      .catch(() => null),
  ]);

  return {
    topViolations: categoryData?.top_violations ?? [],
    topStreets: categoryData?.top_streets ?? [],
    temporal: categoryData?.temporal ?? {},
    agentAnalysis: categoryData?.agents ?? [],
    geojson: geo,
  };
}

export const infracoesCategoryPageQueryOptions = (
  params: Record<string, string>,
  categoryName: string,
) =>
  queryOptions({
    queryKey: ["infracoes", "category-page", categoryName, params],
    queryFn: () => fetchCategoryPage(params, categoryName),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Law (article) detail page ────────────────────────────────────────

async function fetchLawDetail(
  params: Record<string, string>,
  article: string,
) {
  const url = buildUrl(TRAFFIC_VIOLATIONS_LAW(article), { ...params, limit: "10" });
  return fetchJson(url).catch(() => null);
}

export const infracoesLawQueryOptions = (
  params: Record<string, string>,
  article: string,
) =>
  queryOptions({
    queryKey: ["infracoes", "law", article, params],
    queryFn: () => fetchLawDetail(params, article),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Street detail page ───────────────────────────────────────────────

async function fetchStreetDetail(
  params: Record<string, string>,
  identifier: string,
) {
  const url = buildUrl(TRAFFIC_VIOLATIONS_STREET(identifier), { ...params, limit: "20" });
  return fetchJson(url).catch(() => null);
}

export const infracoesStreetQueryOptions = (
  params: Record<string, string>,
  identifier: string,
) =>
  queryOptions({
    queryKey: ["infracoes", "street", identifier, params],
    queryFn: () => fetchStreetDetail(params, identifier),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
