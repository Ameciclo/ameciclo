import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  TRAFFIC_VIOLATIONS_OVERVIEW,
  TRAFFIC_VIOLATIONS_CODES,
  TRAFFIC_VIOLATIONS_CATEGORIES,
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
