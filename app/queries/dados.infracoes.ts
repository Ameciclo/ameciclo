import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  TRAFFIC_VIOLATIONS_OVERVIEW,
  TRAFFIC_VIOLATIONS_CODES,
  TRAFFIC_VIOLATIONS_GEOJSON,
  TRAFFIC_VIOLATIONS_LAW_STATS,
  TRAFFIC_VIOLATIONS_STREET_STATS,
  PLATAFORMA_DADOS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { parsePageData } from "~/services/parsePageData";
import { makeApiErrorTracker } from "~/services/apiTracking";

const FALLBACK_PAGE_DATA = {
  title: "Infrações de Trânsito",
  coverImage: "/pages_covers/infracoes.png",
  explanationBoxes: [
    {
      title: "O que mostram esses dados?",
      description:
        "Analisamos a base de infrações de trânsito registradas no Recife para entender o perfil das autuações. Os dados revelam o que está sendo fiscalizado, não necessariamente tudo o que acontece nas ruas — a presença de fiscalização eletrônica influencia fortemente os números.",
    },
    {
      title: "Por que isso importa?",
      description:
        "Entender quais infrações são mais registradas, onde e quando ocorrem, e quem as fiscaliza é essencial para avaliar se a política de fiscalização prioriza a segurança de quem anda a pé e de bicicleta ou está concentrada em fluidez e estacionamento.",
    },
  ],
};

export type InfracoesFilter = {
  type: "category" | "law" | "street_code";
  value: string;
  label: string;
}

const fetchInfracoesInitial = createServerFn().handler(async () => {
  try {
    const tracker = makeApiErrorTracker();

    const [overviewRaw, codesRaw, pageDataResponse] = await Promise.all([
      cmsFetch<any>(TRAFFIC_VIOLATIONS_OVERVIEW, {
        ttl: 300,
        timeout: 10000,
        fallback: null,
        onError: tracker.at(TRAFFIC_VIOLATIONS_OVERVIEW),
      }),
      cmsFetch<any>(`${TRAFFIC_VIOLATIONS_CODES}?include_by_year=true`, {
        ttl: 600,
        timeout: 10000,
        fallback: null,
        onError: tracker.at(TRAFFIC_VIOLATIONS_CODES),
      }),
      cmsFetch<any>(PLATAFORMA_DADOS_PAGE_DATA("infracoes"), {
        ttl: 600,
        timeout: 5000,
        fallback: null,
        onError: tracker.at("plataformas-de-dados"),
      }),
    ]);

    const pageData = parsePageData(pageDataResponse, FALLBACK_PAGE_DATA);

    const safeOverview = overviewRaw ?? {};
    const safeCodes = codesRaw ?? {};

    const agentBreakdown = (safeOverview.agents ?? []).map((a: any) => ({
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
      by_year: c.by_year ?? {},
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

    const rawCategories = safeOverview.category_breakdown ?? safeOverview.category ?? [];

    // Category breakdown from overview (replaces client-side /categories-detail)
    const categoryBreakdown = rawCategories.map((c: any) => ({
      category: c.category ?? "",
      total: c.count ?? 0,
      percentage: c.percentage ?? 0,
      topViolations: (c.top_violations ?? []).map((v: any) => ({
        law_code: v.law_code ?? "",
        description: v.description ?? "",
        count: v.count ?? 0,
      })),
      by_year: c.by_year ?? [],
      by_month_raw: c.by_month ?? [],
      by_weekday_raw: c.by_weekday ?? [],
      by_hour_raw: c.by_hour ?? [],
    }));

    const categories = rawCategories.map((c: any) => ({
      name: c.category ?? "",
      codeCount: c.law_codes_count ?? 0,
      totalViolations: c.count ?? 0,
    }));

    const agentBreakdownByYearMap: Record<number, any[]> = {};
    for (const a of (safeOverview.agents ?? [])) {
      for (const y of (a.by_year ?? [])) {
        if (!agentBreakdownByYearMap[y.year]) agentBreakdownByYearMap[y.year] = [];
        agentBreakdownByYearMap[y.year].push({
          agentId: a.agent_id,
          description: y.description ?? a.description ?? "",
          count: y.count ?? 0,
          percentage: y.percentage ?? 0,
          category: a.category ?? "manual",
          top_violations: (y.top_violations ?? []).map((v: any) => ({
            law_code: v.law_code ?? "",
            description: v.description ?? "",
            count: v.count ?? 0,
          })),
        });
      }
    }
    const agentBreakdownByYear = Object.entries(agentBreakdownByYearMap).map(([year, agents]) => ({
      year: Number(year),
      agents,
    }));

    const categoryBreakdownByYearMap: Record<number, any[]> = {};
    for (const c of rawCategories) {
      for (const y of (c.by_year ?? [])) {
        if (!categoryBreakdownByYearMap[y.year]) categoryBreakdownByYearMap[y.year] = [];
        categoryBreakdownByYearMap[y.year].push({
          category: c.category ?? "",
          count: y.count ?? 0,
          percentage: y.percentage ?? 0,
          top_violations: (y.top_violations ?? []).map((v: any) => ({
            law_code: v.law_code ?? "",
            description: v.description ?? "",
            count: v.count ?? 0,
          })),
        });
      }
    }
    const categoryBreakdownByYear = Object.entries(categoryBreakdownByYearMap).map(([year, categories]) => ({
      year: Number(year),
      categories,
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
        value: overview.totalViolations,
        unit: `${fmtDate(overview.periodStart)} a ${fmtDate(overview.periodEnd)}`,
      },
      {
        title: "Tipos de infração",
        value: overview.violationTypesCount,
        unit: `${overview.lawCodesCount} artigos do CTB`,
      },
      {
        title: "Média mensal",
        value: monthlyAverage,
        unit: `infrações/mês em ${monthCount} meses`,
      },
      {
        title: "Fiscalização eletrônica",
        value: `${electronicPct.toFixed(1)}%`,
        unit: "das autuações",
      },
    ];

    return {
      pageData,
      overview,
      violationCodes,
      categories,
      statisticsBoxes,
      temporal,
      categoryBreakdown,
      agentBreakdownByYear,
      categoryBreakdownByYear,
      ...tracker.summary(),
    };
  } catch (e) {
    console.error("fetchInfracoesInitial failed:", e);
    return {
      pageData: { ...FALLBACK_PAGE_DATA, supportFiles: [], methodology: null, results: null },
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

// ─── Street stats (dedicated /v1/street-stats endpoint) ──────────

async function fetchStreetStats(filter: InfracoesFilter) {
  const url = buildUrl(TRAFFIC_VIOLATIONS_STREET_STATS, {
    street_code: filter.value,
    limit_violations: "20",
  });
  const raw = await fetchJson(url).catch((err) => {
    console.warn("fetchStreetStats failed:", url, err);
    return null;
  });
  if (!raw) return null;

  const fmtDate = (d: string) => {
    const parts = (d ?? "").slice(0, 10).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  const si = raw.street_info ?? {};

  const agentBreakdown = (raw.agents ?? []).map((a: any) => ({
    agentId: a.agent_id,
    description: a.description ?? "",
    count: a.count ?? 0,
    percentage: a.percentage ?? 0,
    category: a.category ?? "manual",
  }));

  const overview = {
    totalViolations: raw.total_violations ?? 0,
    periodStart: raw.period_start ?? "",
    periodEnd: raw.period_end ?? "",
    violationTypesCount: (raw.violations ?? []).length,
    lawCodesCount: (raw.violations ?? []).length,
    streetsCount: 1,
    neighborhoodsCount: 0,
    agentBreakdown,
  };

  const evo = raw.evolution ?? {};
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

  const rawCategories = raw.category ?? [];
  const categoryBreakdown = rawCategories.map((c: any) => ({
    category: c.category ?? "",
    total: c.count ?? 0,
    percentage: c.percentage ?? 0,
    topViolations: (c.top_violations ?? []).map((v: any) => ({
      law_code: v.law_code ?? "",
      description: v.description ?? "",
      count: v.count ?? 0,
    })),
    by_year: c.by_year ?? [],
    by_month_raw: c.by_month ?? [],
    by_weekday_raw: c.by_weekday ?? [],
    by_hour_raw: c.by_hour ?? [],
  }));

  const agentBreakdownByYearMap: Record<number, any[]> = {};
  for (const a of (raw.agents ?? [])) {
    for (const y of (a.by_year ?? [])) {
      if (!agentBreakdownByYearMap[y.year]) agentBreakdownByYearMap[y.year] = [];
      agentBreakdownByYearMap[y.year].push({
        agentId: a.agent_id,
        description: y.description ?? a.description ?? "",
        count: y.count ?? 0,
        percentage: y.percentage ?? 0,
        category: a.category ?? "manual",
        top_violations: (y.top_violations ?? []).map((v: any) => ({
          law_code: v.law_code ?? "",
          description: v.description ?? "",
          count: v.count ?? 0,
        })),
      });
    }
  }
  const agentBreakdownByYearComputed = Object.entries(agentBreakdownByYearMap).map(([year, agents]) => ({
    year: Number(year),
    agents,
  }));

  const categoryBreakdownByYearMap: Record<number, any[]> = {};
  for (const c of rawCategories) {
    for (const y of (c.by_year ?? [])) {
      if (!categoryBreakdownByYearMap[y.year]) categoryBreakdownByYearMap[y.year] = [];
      categoryBreakdownByYearMap[y.year].push({
        category: c.category ?? "",
        count: y.count ?? 0,
        percentage: y.percentage ?? 0,
        top_violations: (y.top_violations ?? []).map((v: any) => ({
          law_code: v.law_code ?? "",
          description: v.description ?? "",
          count: v.count ?? 0,
        })),
      });
    }
  }
  const categoryBreakdownByYearComputed = Object.entries(categoryBreakdownByYearMap).map(([year, categories]) => ({
    year: Number(year),
    categories,
  }));

  const electronicPct = agentBreakdown
    .filter((a: any) => a.category === "eletronico")
    .reduce((sum: number, a: any) => sum + a.percentage, 0);

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
      value: overview.totalViolations,
      unit: `${fmtDate(overview.periodStart)} a ${fmtDate(overview.periodEnd)}`,
    },
    {
      title: "Extensão da via",
      value: si.extension_km ? `${si.extension_km.toFixed(1)} km` : "—",
      unit: "quilômetros",
    },
    {
      title: "Infrações por km",
      value: si.violations_per_km != null ? `${Number(si.violations_per_km).toFixed(1)}` : "—",
      unit: "infrações/km",
    },
    {
      title: "Fiscalização eletrônica",
      value: `${electronicPct.toFixed(1)}%`,
      unit: "das autuações",
    },
  ];

  const lawCodes = (raw.violations ?? []).map((v: any) => {
    const byYearCode: Record<string, number> = {};
    for (const item of v.by_year ?? []) {
      if (item.year) byYearCode[String(item.year)] = item.count ?? 0;
    }
    return {
      code: v.law_code ?? "",
      lawCode: v.law_code ?? "",
      description: v.description ?? "",
      count: v.count ?? 0,
      category: "",
      by_year: byYearCode,
    };
  });

  const violationCodes = lawCodes;

  const categories = (raw.category ?? []).map((c: any) => ({
    name: c.category ?? "",
    codeCount: 0,
    totalViolations: c.count ?? 0,
  }));

  return {
    overview,
    violationCodes,
    categories,
    statisticsBoxes,
    temporal,
    categoryBreakdown,
    agentBreakdownByYear: agentBreakdownByYearComputed,
    categoryBreakdownByYear: categoryBreakdownByYearComputed,
    lawCodes,
    topStreets: [] as any[],
    streetOfficialName: si.official_name ?? "",
    streetExtensionKm: si.extension_km ?? 0,
  };
}

export const infracoesStreetStatsQueryOptions = (filter: InfracoesFilter) =>
  queryOptions({
    queryKey: ["infracoes", "street-stats", filter],
    queryFn: () => fetchStreetStats(filter),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

// ─── Law stats (replaces /v1/overview?law= for law filter) ──────────

async function fetchLawStats(filter: InfracoesFilter) {
  const url = buildUrl(TRAFFIC_VIOLATIONS_LAW_STATS, { law: filter.value });
  const raw = await fetchJson(url).catch((err) => {
    console.warn("fetchLawStats failed:", url, err);
    return null;
  });
  if (!raw) return null;

  const fmtDate = (d: string) => {
    const parts = (d ?? "").slice(0, 10).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  const lawCodeBreakdown = (raw.law_code_breakdown ?? []).map((c: any, i: number) => {
    const byYear: Record<string, number> = {};
    for (const item of c.evolution?.by_year ?? []) {
      if (item.year) byYear[String(item.year)] = item.count ?? 0;
    }

    return {
      label: String.fromCharCode(65 + i),
      lawCode: c.law_code ?? "",
      description: c.description ?? "",
      count: c.count ?? 0,
      by_year: byYear,
      evolution: {
        by_year_raw: c.evolution?.by_year ?? [],
        by_month_raw: c.evolution?.by_month ?? [],
        by_weekday_raw: c.evolution?.by_weekday ?? [],
        by_hour_raw: c.evolution?.by_hour ?? [],
      },
    };
  });

  const byYearAll: Record<string, number> = {};
  const byMonthAll: any[] = [];
  const byWeekdayAll: any[] = [];
  const byHourAll: any[] = [];

  for (const lc of lawCodeBreakdown) {
    for (const item of lc.evolution.by_year_raw) {
      byYearAll[String(item.year)] = (byYearAll[String(item.year)] ?? 0) + (item.count ?? 0);
    }
    byMonthAll.push(...lc.evolution.by_month_raw);
    byWeekdayAll.push(...lc.evolution.by_weekday_raw);
    byHourAll.push(...lc.evolution.by_hour_raw);
  }

  const lawCodes = lawCodeBreakdown.map((c: any) => ({
    code: c.lawCode,
    lawCode: c.lawCode,
    description: c.description,
    count: c.count,
    category: "",
    by_year: c.by_year,
  }));

  return {
    overview: {
      totalViolations: raw.total_violations ?? 0,
      periodStart: fmtDate(raw.period_start ?? ""),
      periodEnd: fmtDate(raw.period_end ?? ""),
      agentBreakdown: [] as any[],
    },
    lawCodes,
    lawStats: lawCodeBreakdown,
    temporal: {
      by_year: byYearAll,
      by_month_raw: byMonthAll,
      by_weekday_raw: byWeekdayAll,
      by_hour_raw: byHourAll,
    },
    violationCodes: [],
    categories: [] as any[],
    categoryBreakdown: [] as any[],
    agentBreakdownByYear: [] as any[],
    categoryBreakdownByYear: [] as any[],
    statisticsBoxes: [] as any[],
  };
}

export const infracoesLawStatsQueryOptions = (filter: InfracoesFilter) =>
  queryOptions({
    queryKey: ["infracoes", "law-stats", filter],
    queryFn: () => fetchLawStats(filter),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });

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
