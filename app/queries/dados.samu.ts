import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  SAMU_SUMMARY_API,
  SAMU_CITIES_LIST,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";

const ANO_INICIAL = 2020;

const fetchSamu = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  try {
    const cover = "/pages_covers/chamadosdosamu.png";
    const title1 = "O que são chamadas de sinistro?";
    const description1 =
      "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária em Pernambuco.";
    const title2 = "Como utilizamos os dados?";
    const description2 =
      "Processamos dados reais de chamadas do SAMU para mapear sinistros por localização, gravidade, características temporais e perfil das vítimas.";

    const [summaryData, citiesData] = await Promise.all([
      cmsFetch<any>(SAMU_SUMMARY_API, {
        ttl: 300,
        timeout: 10000,
        fallback: null,
        onError: tracker.at(SAMU_SUMMARY_API),
        retries: 1,
      }),
      cmsFetch<any>(SAMU_CITIES_LIST, {
        ttl: 300,
        timeout: 10000,
        fallback: null,
        onError: tracker.at(SAMU_CITIES_LIST),
        retries: 1,
      }),
    ]);

    if (!summaryData || !citiesData) {
      throw new Error(
        "Não foi possível carregar os dados do SAMU. " +
        "Verifique se o serviço de backend está disponível e tente novamente."
      );
    }

    const evolucaoAnual = (summaryData.evolucaoAnual || []).filter(
      (item: any) => item.ano >= ANO_INICIAL
    );
    const totalChamadas = evolucaoAnual.reduce(
      (sum: number, item: any) => sum + (item.count || 0),
      0
    );
    const yearsFromApi = evolucaoAnual.map((item: any) => item.ano).filter(Boolean) as number[];
    const yearRange = yearsFromApi.length > 0
      ? `${Math.min(...yearsFromApi)} - ${Math.max(...yearsFromApi)}`
      : "";
    const anoMaisViolento =
      evolucaoAnual.length > 0
        ? evolucaoAnual.reduce((max: any, curr: any) =>
            curr.count > max.count ? curr : max
          )
        : { ano: 0, count: 0 };

    const cidadeMaisViolenta = summaryData.cidadeMaisViolenta || {};
    const totalCidades = citiesData.cidades?.length || 0;

    const citiesWithDetails = citiesData.cidades.map(
      (city: any, index: number) => {
        const municipio =
          city.municipio_samu ||
          city.name ||
          city.municipio ||
          `CIDADE_${index}`;
        return {
          ...city,
          municipio,
          name: city.display_name || city.name || municipio,
          municipio_samu: city.municipio_samu || municipio,
          historico_anual: (city.historico_anual || []).filter(
            (item: any) => item.ano >= ANO_INICIAL
          ),
        };
      }
    );

    const processedData = {
      totalChamadas,
      anoMaisViolento: {
        ano: anoMaisViolento.ano || 0,
        total: anoMaisViolento.count || 0,
      },
      cidadeMaisViolenta: {
        municipio: cidadeMaisViolenta.municipio || "N/A",
        total: cidadeMaisViolenta.totalValidas || 0,
        percentual:
          totalChamadas > 0
            ? ((cidadeMaisViolenta.totalValidas || 0) / totalChamadas) * 100
            : 0,
      },
      totalMunicipios: totalCidades,
      citiesData: { ...citiesData, cidades: citiesWithDetails },
    };

    const statisticsBoxes = [
      {
        title: "Total de chamadas",
        value: processedData.totalChamadas.toLocaleString(),
        unit: yearRange,
      },
      {
        title: "Ano mais violento",
        value: processedData.anoMaisViolento.ano.toString(),
        unit: `${processedData.anoMaisViolento.total.toLocaleString()} chamadas`,
      },
      {
        title: "Area de cobertura (PE)",
        value: processedData.totalMunicipios.toString(),
        unit: "municipios",
      },
      {
        title: "Cidade mais violenta",
        value: processedData.cidadeMaisViolenta.municipio,
        unit: `${processedData.cidadeMaisViolenta.percentual.toFixed(1)}% das chamadas`,
      },
    ];

    const documents = {
      title: "Documentos relacionados",
      cards: [
        {
          title: "Metodologia",
          description: "Como analisamos os dados das chamadas do SAMU",
          url: "#metodologia",
          target: "_self",
        },
        {
          title: "Dados abertos",
          description: "Acesse os dados brutos das chamadas do SAMU",
          url: "https://emergency-calls.atlas.ameciclo.org",
          target: "_blank",
        },
      ],
    };

    const summary = tracker.summary();

    return {
      cover,
      title1,
      description1,
      title2,
      description2,
      documents,
      statisticsBoxes,
      citiesData: processedData.citiesData,
      apiDown: summary.apiDown,
      apiErrors: summary.apiErrors,
    };
  } catch (error) {
    console.error("Erro critico no SAMU Loader:", error);
    throw error;
  }
});

export const samuQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "samu"],
    queryFn: () => fetchSamu(),
  });
