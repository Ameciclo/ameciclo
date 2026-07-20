import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  SAMU_SUMMARY_API,
  SAMU_CITIES_LIST,
  PLATAFORMA_DADOS_PAGE_DATA,
  EMERGENCY_CALLS_ATLAS_URL,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { parsePageData } from "~/services/parsePageData";
import { makeApiErrorTracker } from "~/services/apiTracking";

const ANO_INICIAL = 2020;

const FALLBACK_PAGE_DATA = {
  title: "Chamados de Emergência",
  coverImage: "/pages_covers/chamadosdosamu.png",
  explanationBoxes: [
    {
      title: "O que são chamadas de sinistro?",
      description:
        "Analisamos os chamados de emergência relacionados a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária em Pernambuco.",
    },
    {
      title: "Como utilizamos os dados?",
      description:
        "Processamos dados reais de chamados de emergência para mapear sinistros por localização, gravidade, características temporais e perfil das vítimas.",
    },
  ],
};

const fetchSamu = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  try {
    const [summaryData, citiesData, pageDataResponse] = await Promise.all([
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
      cmsFetch<any>(PLATAFORMA_DADOS_PAGE_DATA("chamados-emergencia"), {
        ttl: 600,
        timeout: 5000,
        fallback: null,
        onError: tracker.at("plataformas-de-dados"),
      }),
    ]);

    const pageData = parsePageData(pageDataResponse, FALLBACK_PAGE_DATA);

    if (!summaryData || !citiesData) {
      throw new Error(
        "Não foi possível carregar os dados de chamados de emergência. " +
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
          description: "Como analisamos os dados dos chamados de emergência",
          url: "#metodologia",
          target: "_self",
        },
        {
          title: "Dados abertos",
          description: "Acesse os dados brutos dos chamados de emergência",
          url: EMERGENCY_CALLS_ATLAS_URL,
          target: "_blank",
        },
      ],
    };

    const summary = tracker.summary();

    return {
      pageData,
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
