import { queryOptions } from "@tanstack/react-query";
import type { ContagemData, SummaryData } from "~/services/contagens.service";
import { COUNTINGS_SUMMARY_DATA, COUNTINGS_PAGE_DATA } from "~/servers";

export const contagensLoaderQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "contagens", "loader"],
    queryFn: async () => {
      try {
        const [summaryRes, pageRes] = await Promise.all([
          fetch(COUNTINGS_SUMMARY_DATA, { cache: "no-cache" }),
          fetch(COUNTINGS_PAGE_DATA, { cache: "no-cache" })
        ]);

        const summaryDataJson = await summaryRes.json();
        const pageData = await pageRes.json();

        return {
          summaryData: summaryDataJson.summary as SummaryData,
          data: summaryDataJson.counts as ContagemData[],
          pageData,
        };
      } catch (error) {
        console.error("Erro ao carregar dados de contagens:", error);
        return {
          summaryData: null,
          data: [],
          pageData: null,
        };
      }
    },
  });

// Keep for backwards compatibility
export async function contagensLoader() {
  return contagensLoaderQueryOptions().queryFn({} as any);
}
