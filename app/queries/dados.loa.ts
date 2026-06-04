import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { LOA_PAGE_DATA, STATE_BUDGET_API } from "~/servers";

const fetchLoa = createServerFn().handler(async () => {
  const errors: Array<{ url: string; error: string }> = [];

  let loaDescription =
    "O LOA Clima é um projeto de Incidência Política nas Leis Orçamentárias do Governo do Estado de Pernambuco. O projeto abarca a análise da aplicação de recursos do último Plano Plurianual do Governo do Estado de Pernambuco, bem como a proposição de um arcabouço orçamentário que promova justiça climática. Serão realizadas atividades de formação e alinhamento de propostas com a sociedade civil organizada, de articulação com secretarias estaduais para proposição de itens orçamentários e de articulação com a Assembleia Legislativa Estadual para a proposição de emendas.";

  try {
    const cmsData = await cmsFetch<any>(LOA_PAGE_DATA, {
      ttl: 600,
      timeout: 3000,
      fallback: null,
    });
    if (cmsData?.description) {
      loaDescription = cmsData.description;
    }
  } catch {
    // Silenciosamente usar fallback
  }

  const fetchJson = async (url: string, timeout = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AmecicloBot/1.0)",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        errors.push({ url, error: `HTTP ${response.status}` });
        return null;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      const errorMessage =
        error instanceof Error
          ? error.name === "AbortError"
            ? "Timeout"
            : error.message
          : String(error);
      errors.push({ url, error: errorMessage || "Erro desconhecido" });
      return null;
    }
  };

  const summaryUrl = `${STATE_BUDGET_API}/summary`;
  const summary = await fetchJson(summaryUrl);

  const yearlyComparison = summary?.yearlyComparison || [];

  const years = [2020, 2021, 2022, 2023, 2024];

  const actionsByYear: Record<number, any[]> = {};

  const actionsPromises = years.map(async (year) => {
    const url = `${STATE_BUDGET_API}/actions?year=${year}`;
    const data = await fetchJson(url);
    const actions = data?.actions || [];
    return { year, actions };
  });

  const actionsResults = await Promise.all(actionsPromises);
  let latestActions: any[] = [];

  const climatePerYear: Record<number, { budgeted: number; executed: number }> = {};
  const statePerYear: Record<number, number> = {};

  for (const { year, actions } of actionsResults) {
    actionsByYear[year] = actions;
    if (actions.length > 0) {
      latestActions = actions;
    }

    let climateBudgeted = 0;
    let climateExecuted = 0;
    let stateTotal = 0;

    for (const action of actions) {
      const dot = action.vlrdotatualizada || 0;
      const pago = action.vlrtotalpago || 0;
      stateTotal += dot;
      if (action.classification === "good") {
        climateBudgeted += dot;
        climateExecuted += pago;
      }
    }

    climatePerYear[year] = { budgeted: climateBudgeted, executed: climateExecuted };
    statePerYear[year] = stateTotal;
  }

  const summaryByYear: Record<number, number> = {};
  for (const entry of yearlyComparison) {
    summaryByYear[entry.year] = entry.budgeted;
  }

  const getClimate = (year: number) => climatePerYear[year] || { budgeted: 0, executed: 0 };
  const getState = (year: number) => summaryByYear[year] || statePerYear[year] || 0;

  return {
    cover: { url: "" },
    description: loaDescription,
    totalValueEmissions: 0,
    totalValueBudgeted2020: getClimate(2020).budgeted,
    totalValueExecuted2020: getClimate(2020).executed,
    totalValueActions2020: getState(2020),
    totalValueBudgeted2021: getClimate(2021).budgeted,
    totalValueExecuted2021: getClimate(2021).executed,
    totalValueActions2021: getState(2021),
    totalValueBudgeted2022: getClimate(2022).budgeted,
    totalValueExecuted2022: getClimate(2022).executed,
    totalValueActions2022: getState(2022),
    totalValueBudgeted2023: getClimate(2023).budgeted,
    totalValueExecuted2023: getClimate(2023).executed,
    totalValueActions2023: getState(2023),
    totalValueBudgeted2024: getClimate(2024).budgeted,
    totalValueExecuted2024: getClimate(2024).executed,
    totalValueActions2024: getState(2024),
    totalValueBudgeted2025: 0,
    totalValueExecuted2025: 0,
    totalValueActions2025: 0,
    actions2025: latestActions,
    apiDown: errors.length > 0,
    apiErrors: errors,
  };
});

export const loaQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "loa"],
    queryFn: () => fetchLoa(),
  });
