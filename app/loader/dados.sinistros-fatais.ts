import { LoaderFunctionArgs } from "@remix-run/node";
import { fetchDatasusSummary, fetchDatasusCitiesByYear, fetchSinistrosFataisPageData } from "~/services/datasus.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Buscar dados em paralelo
    const [summary, citiesByYear, pageData] = await Promise.allSettled([
      fetchDatasusSummary(),
      fetchDatasusCitiesByYear(),
      fetchSinistrosFataisPageData()
    ]);

    // Dados padrão em caso de erro
    const defaultSummary = {
      porLocalOcorrencia: {
        totalSinistrosUltimos10Anos: 0,
        totalUltimoAno: 0,
        ultimoAno: 2022,
        crescimentoRelacaoAnoAnterior: 0,
        anoMaisViolento: { ano: 2019, total: 0 },
        dadosPorAno: []
      },
      porLocalResidencia: {
        totalSinistrosUltimos10Anos: 0,
        totalUltimoAno: 0,
        ultimoAno: 2022,
        crescimentoRelacaoAnoAnterior: 0,
        anoMaisViolento: { ano: 2019, total: 0 },
        dadosPorAno: []
      }
    };

    const defaultCitiesByYear = {
      tipo: "Local de Ocorrência",
      anos: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
      cidades: []
    };

    const defaultPageData = {
      id: 4,
      title: "Observatório de Sinistros Fatais",
      coverImage: "/images/covers/sinistros-fatais.jpg",
      explanationBoxes: [],
      supportFiles: []
    };

    return {
      summary: summary.status === "fulfilled" ? summary.value : defaultSummary,
      citiesByYear: citiesByYear.status === "fulfilled" ? citiesByYear.value : defaultCitiesByYear,
      pageData: pageData.status === "fulfilled" && pageData.value ? pageData.value : defaultPageData
    };
  } catch (error) {
    console.error("Erro no loader de sinistros-fatais:", error);
    throw new Response("Erro interno do servidor", { status: 500 });
  }
}