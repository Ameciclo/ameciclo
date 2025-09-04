import { defer } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { DATASUS_SUMMARY_DATA, DATASUS_CITIES_BY_YEAR_DATA, OBSERVATORIO_SINISTROS_PAGE_DATA } from "~/servers";

export async function loader() {
  try {

    // Dados mock para fallback
    const mockSummary = {
      porLocalOcorrencia: {
        totalSinistrosUltimos10Anos: 1250,
        totalUltimoAno: 125,
        ultimoAno: 2022,
        crescimentoRelacaoAnoAnterior: -5.2,
        anoMaisViolento: { ano: 2019, total: 145 },
        dadosPorAno: []
      },
      porLocalResidencia: {
        totalSinistrosUltimos10Anos: 1180,
        totalUltimoAno: 118,
        ultimoAno: 2022,
        crescimentoRelacaoAnoAnterior: -3.8,
        anoMaisViolento: { ano: 2019, total: 138 },
        dadosPorAno: []
      }
    };

    const mockCitiesByYear = {
      tipo: "Local de Ocorrência",
      anos: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
      cidades: []
    };

    const mockPageData = {
      id: 4,
      title: "Observatório de Sinistros Fatais",
      coverImage: "/pages_covers/sinistros-fatais.png",
      explanationBoxes: [],
      supportFiles: []
    };

    // Buscar dados de forma assíncrona
    const summaryPromise = fetchWithTimeout(DATASUS_SUMMARY_DATA, {}, 15000, mockSummary);
    const citiesByYearPromise = fetchWithTimeout(DATASUS_CITIES_BY_YEAR_DATA, {}, 15000, mockCitiesByYear);
    const pageDataPromise = fetchWithTimeout(OBSERVATORIO_SINISTROS_PAGE_DATA, {}, 15000, mockPageData);

    return defer({
      summary: summaryPromise,
      citiesByYear: citiesByYearPromise,
      pageData: pageDataPromise
    });
  } catch (error) {
    console.error("Erro no loader de sinistros-fatais:", error);
    
    return defer({
      summary: Promise.resolve({
        porLocalOcorrencia: {
          totalSinistrosUltimos10Anos: 1250,
          totalUltimoAno: 125,
          ultimoAno: 2022,
          crescimentoRelacaoAnoAnterior: -5.2,
          anoMaisViolento: { ano: 2019, total: 145 },
          dadosPorAno: []
        },
        porLocalResidencia: {
          totalSinistrosUltimos10Anos: 1180,
          totalUltimoAno: 118,
          ultimoAno: 2022,
          crescimentoRelacaoAnoAnterior: -3.8,
          anoMaisViolento: { ano: 2019, total: 138 },
          dadosPorAno: []
        }
      }),
      citiesByYear: Promise.resolve({
        tipo: "Local de Ocorrência",
        anos: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
        cidades: []
      }),
      pageData: Promise.resolve({
        id: 4,
        title: "Observatório de Sinistros Fatais",
        coverImage: "/pages_covers/sinistros-fatais.png",
        explanationBoxes: [],
        supportFiles: []
      })
    });
  }
}