import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import {
  DATASUS_SUMMARY_DATA,
  DATASUS_CITIES_BY_YEAR_DATA,
  OBSERVATORIO_SINISTROS_PAGE_DATA,
} from "~/servers";

const MOCK_PAGE_DATA = {
  id: 4,
  title: "Observatório de Sinistros Fatais",
  coverImage: "/pages_covers/sinistros-fatais.png",
  explanationBoxes: [
    {
      title: "O que são esses dados?",
      description:
        "Dados de mortalidade no trânsito extraídos do Sistema de Informações sobre Mortalidade (SIM) do DATASUS, considerando os códigos CID-10 de V01 a V89 (acidentes de transporte terrestre).",
    },
    {
      title: "Local de Ocorrência vs. Residência",
      description:
        "Local de Ocorrência indica onde o sinistro aconteceu, enquanto Local de Residência mostra onde a vítima morava. Essa distinção é importante para análises de políticas públicas e planejamento urbano.",
    },
  ],
  supportFiles: [],
};

const fetchSinistrosFatais = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [summary, citiesByYear, pageData] = await Promise.all([
    cmsFetch<any>(DATASUS_SUMMARY_DATA, {
      ttl: 300,
      timeout: 10000,
      fallback: null,
      onError: tracker.at(DATASUS_SUMMARY_DATA),
      retries: 2,
    }),
    cmsFetch<any>(DATASUS_CITIES_BY_YEAR_DATA, {
      ttl: 300,
      timeout: 10000,
      fallback: null,
      onError: tracker.at(DATASUS_CITIES_BY_YEAR_DATA),
      retries: 2,
    }),
    cmsFetch<any>(OBSERVATORIO_SINISTROS_PAGE_DATA, {
      ttl: 600,
      timeout: 10000,
      fallback: MOCK_PAGE_DATA,
      onError: tracker.at(OBSERVATORIO_SINISTROS_PAGE_DATA),
      retries: 2,
    }),
  ]);

  return {
    summary,
    citiesByYear,
    pageData,
    ...tracker.summary(),
  };
});

export const sinistrosFataisQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "sinistros-fatais"],
    queryFn: () => fetchSinistrosFatais(),
  });
