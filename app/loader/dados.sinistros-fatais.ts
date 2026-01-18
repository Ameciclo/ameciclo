import { defer } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { TRAFFIC_DEATHS_SUMMARY, DATASUS_CITIES_BY_YEAR_DATA, OBSERVATORIO_SINISTROS_PAGE_DATA } from "~/servers";

const MOCK_PAGE_DATA = {
  id: 4,
  title: "Observatório de Sinistros Fatais",
  coverImage: "/pages_covers/sinistros-fatais.png",
  explanationBoxes: [
    {
      title: "O que são esses dados?",
      description: "Dados de mortalidade no trânsito extraídos do Sistema de Informações sobre Mortalidade (SIM) do DATASUS, considerando os códigos CID-10 de V01 a V89 (acidentes de transporte terrestre)."
    },
    {
      title: "Local de Ocorrência vs. Residência",
      description: "Local de Ocorrência indica onde o sinistro aconteceu, enquanto Local de Residência mostra onde a vítima morava. Essa distinção é importante para análises de políticas públicas e planejamento urbano."
    }
  ],
  supportFiles: []
};

export async function loader() {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const [summary, citiesByYear, pageData] = await Promise.all([
    fetchWithTimeout(
      TRAFFIC_DEATHS_SUMMARY, 
      {}, 
      10000, 
      null, 
      onError(TRAFFIC_DEATHS_SUMMARY),
      2
    ),
    fetchWithTimeout(
      DATASUS_CITIES_BY_YEAR_DATA, 
      {}, 
      10000, 
      null, 
      onError(DATASUS_CITIES_BY_YEAR_DATA),
      2
    ),
    fetchWithTimeout(
      OBSERVATORIO_SINISTROS_PAGE_DATA,
      {},
      10000,
      MOCK_PAGE_DATA,
      onError(OBSERVATORIO_SINISTROS_PAGE_DATA),
      2
    )
  ]);

  return defer({
    summary: Promise.resolve(summary),
    citiesByYear: Promise.resolve(citiesByYear),
    pageData: Promise.resolve(pageData),
    apiDown: errors.length > 0,
    apiErrors: errors,
  });
}