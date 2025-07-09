import { json } from "@remix-run/node";
import type { ContagemData, SummaryData } from "~/services/contagens.service";

const COUNTINGS_SUMMARY_DATA = "https://api.garfo.ameciclo.org/cyclist-counts";
const COUNTINGS_PAGE_DATA = "https://cms.ameciclo.org/contagens";

export async function contagensLoader() {
  try {
    const [summaryRes, pageRes] = await Promise.all([
      fetch(COUNTINGS_SUMMARY_DATA, { cache: "no-cache" }),
      fetch(COUNTINGS_PAGE_DATA, { cache: "no-cache" })
    ]);

    const summaryDataJson = await summaryRes.json();
    const pageData = await pageRes.json();

    return json({
      summaryData: summaryDataJson.summary as SummaryData,
      data: summaryDataJson.counts as ContagemData[],
      pageData,
    });
  } catch (error) {
    console.error("Erro ao carregar dados de contagens:", error);
    return json({
      summaryData: null,
      data: [],
      pageData: null,
    });
  }
}