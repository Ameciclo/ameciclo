import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { DOM_PAGE_DATA, RECIFE_BUDGET_API } from "~/servers";

const fetchDom = createServerFn().handler(async () => {
  const errors: Array<{ url: string; error: string }> = [];

  let cover = { url: "/pages_covers/dom-cover.jpg" };
  let description = "O Diagnóstico Orçamentário Municipal é uma iniciativa que visa integrar práticas de mobilidade sustentável nas políticas públicas por meio da análise do orçamento público. Com foco na promoção de sistemas de transporte eficientes e ecológicos, o plano busca incorporar diretrizes que fomentar a utilização de bicicletas e outros meios de transporte sustentável nas cidades. Além de estudar a alocação de recursos, o projeto propõe estratégias que envolvam a participação da sociedade civil e do poder público para a melhoria da mobilidade sustentável. Assim, o plano não apenas mapeia as necessidades atuais, mas também projeta um futuro mais sustentável e acessível, contribuindo para a melhoria da qualidade da vida urbana.";

  try {
    const cmsData = await cmsFetch<any>(DOM_PAGE_DATA, {
      ttl: 600,
      timeout: 3000,
      fallback: null,
    });
    if (cmsData?.data?.cover) {
      cover = cmsData.data.cover;
    }
    if (cmsData?.data?.description) {
      description = cmsData.data.description;
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

  const summaryUrl = `${RECIFE_BUDGET_API}/summary`;
  const summary = await fetchJson(summaryUrl);

  const actionsGoodUrl = `${RECIFE_BUDGET_API}/actions?year=2024&type=good`;
  const actionsBadUrl = `${RECIFE_BUDGET_API}/actions?year=2024&type=bad`;

  const [actionsGood, actionsBad] = await Promise.all([
    fetchJson(actionsGoodUrl),
    fetchJson(actionsBadUrl),
  ]);

  const totalGoodActions = actionsGood?.actions || [];
  const totalBadActions = actionsBad?.actions || [];

  const yearlyComparisonRaw = summary?.yearlyComparison || [];
  const goodActionsYearlyRaw = summary?.goodActionsYearly || [];
  const totalSpendingYearlyRaw = summary?.totalSpendingYearly || [];

  const yearlyComparison = [
    ["Ano", "Sustentável (R$)", "Não sustentável (R$)"],
    ...yearlyComparisonRaw.map((entry: any) => [
      String(entry.year),
      entry.sustainable,
      entry.unsustainable,
    ]),
  ];

  const goodActionsYearly = [
    ["Ano", "Orçado em boas ações"],
    ...goodActionsYearlyRaw.map((entry: any) => [
      String(entry.year),
      entry.total,
    ]),
  ];

  const totalSpendingYearly = [
    ["Ano", "Total Boas/Más"],
    ...totalSpendingYearlyRaw.map((entry: any) => [
      String(entry.year),
      entry.total,
    ]),
  ];

  return {
    cover,
    description,
    totalGoodActions,
    totalBadActions,
    chartData: {
      yearlyComparison,
      goodActionsYearly,
      totalSpendingYearly,
    },
    sustainableTotal: summary?.sustainableTotal || 0,
    unsustainableTotal: summary?.unsustainableTotal || 0,
    carbonValue: summary?.carbonValue || 0,
    apiDown: errors.length > 0,
    apiErrors: errors,
  };
});

export const domQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "dom"],
    queryFn: () => fetchDom(),
  });
