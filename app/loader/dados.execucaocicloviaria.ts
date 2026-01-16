import { LoaderFunction } from "@remix-run/node";
import { IntlNumberMax1Digit, IntlPercentil } from "~/services/utils";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { EXECUCAO_CICLOVIARIA_DATA, EXECUCAO_CICLOVIARIA_SUMMARY, EXECUCAO_CICLOVIARIA_RELATIONS, PDC_VOL1_URL, PDC_VOL2_URL, PDC_PASTA_URL, CICLOMAPA_URL, PDC_PODCAST_URL, PDC_WIKI_URL } from "~/servers";

export const loader: LoaderFunction = async () => {
  const apiErrors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    apiErrors.push({ url, error });
  };

  const page_data = {
    title: 'Observatório Cicloviário',
    cover_image_url: '/execucaocicloviaria.png',
    ExplanationBoxData: {
      title_1: 'O que é?',
      text_1: `O Observatório Cicloviário é uma central de monitoramento que acompanha a evolução da estrutura cicloviária da Região Metropolitana do Recife, comparando a estrutura projetada pelo Plano Diretor Cicloviário frente à estrutura executada.
            Para facilitar a demonstração dos dados, considera-se EXECUTADA o local onde havia previsão de estrutura e foi implatado algo lá, não necessariamente da mesma tipologia.`,
      title_2: 'Por que o PDC?',
      text_2: `Em 4 de fevereiro de 2014 o Governo do Estado de Pernambuco, junto com as prefeituras da Região Metropolitana do Recife, lançou o Plano Diretor Cicloviário (PDC). 
            O Plano integra os diversos municípios da RMR com uma ampla rede cicloviária, priorizando as principais avenidas e pontos de conexão das cidades. Sua construção teve participação não só dos entes públicos, mas também da sociedade civil, como nós, da Ameciclo. 
            Com metas estipuladas em fases,  o PDC precisa ser concluído em 2024.`
    }
  };

  const cycleStructureExecutionStatistics = (data: any) => {
    const { pdc_feito, out_pdc, pdc_total, percent } = { ...data };

    return [
      {
        title: "estrutura cicloviárias existentes",
        unit: "km",
        value: IntlNumberMax1Digit(pdc_feito + out_pdc),
      },
      {
        title: "projetada no plano cicloviário",
        unit: "km",
        value: IntlNumberMax1Digit(pdc_total),
      },
      {
        title: "implantados no plano cicloviário",
        unit: "km",
        value: IntlNumberMax1Digit(pdc_feito),
      },
      {
        title: "cobertos do plano cicloviário",
        unit: "%",
        value: IntlPercentil(percent),
      },
    ];
  };

  const PDCLayer = {
    id: "Não executado no PDC",
    type: "line",
    paint: {
      "line-color": "#E02F31",
      "line-opacity": 0.5,
      "line-width": 2,
    },
    filter: ["==", "status_type", "pdc_nao_realizado"],
  };

  const PDCDoneLayer = {
    id: "Executados dentro do PDC",
    type: "line",
    paint: {
      "line-color": "#008080",
      "line-width": 3,
    },
    filter: ["in", "status_type", "pdc_realizado_designado", "pdc_realizado_nao_designado"],
  };

  const NotPDC = {
    id: "Executados fora do PDC",
    type: "line",
    paint: {
      "line-color": "#DDDF00",
      "line-width": 1.5,
      "line-opacity": 0.8,
    },
    filter: ["==", "status_type", "realizado_fora_pdc"],
  };

  const layersConf = [PDCLayer, PDCDoneLayer, NotPDC];

  function cityCycleStructureExecutionStatisticsByCity(
    citiesSummary: any,
    citiesData: any,
    relationsByCityData: any,
  ) {
    const cityStats: any = {};
    citiesData.forEach((city: any) => {
      if (citiesSummary[city.id]) {
        const { relations } = { ...relationsByCityData[city.id] };
        cityStats[city.id] = {
          id: city.id,
          name: city.name,
          relations: relations,
          ...citiesSummary[city.id],
          total:
            citiesSummary[city.id].pdc_feito + citiesSummary[city.id].out_pdc,
        };
      }
    });

    return cityStats;
  }

  const fallbackData = {
    type: "FeatureCollection",
    features: []
  };

  const fallbackStats = {
    pdc_feito: 0,
    out_pdc: 0,
    pdc_total: 0,
    percent: 0
  };

  // Mapeamento de IDs de cidades para nomes (IBGE oficial)
  // Validado com servicodados.ibge.gov.br/api/v1/localidades/municipios/{id}
  const cityNamesMap: Record<string, string> = {
    '2600054': 'Abreu e Lima',
    '2601052': 'Araçoiaba',
    '2602902': 'Cabo de Santo Agostinho',
    '2603454': 'Camaragibe',
    '2606804': 'Igarassu',
    '2607208': 'Ipojuca',
    '2607604': 'Ilha de Itamaracá',
    '2607752': 'Itapissuma',
    '2607901': 'Jaboatão dos Guararapes',
    '2609402': 'Moreno',
    '2609600': 'Olinda',
    '2610707': 'Paulista',
    '2611606': 'Recife',
    '2613701': 'São Lourenço da Mata'
  };

  // IDs de cidades da RMR (Região Metropolitana do Recife)
  const rmrCityIds = new Set(Object.keys(cityNamesMap));

  const [apiData, summaryData, relationsData] = await Promise.all([
    fetchWithTimeout(
      EXECUCAO_CICLOVIARIA_DATA,
      { cache: "no-cache" },
      15000,
      fallbackData,
      onError(EXECUCAO_CICLOVIARIA_DATA),
      2
    ),
    fetchWithTimeout(
      EXECUCAO_CICLOVIARIA_SUMMARY,
      { cache: "no-cache" },
      15000,
      { all: fallbackStats, byCity: {} },
      onError(EXECUCAO_CICLOVIARIA_SUMMARY),
      2
    ),
    fetchWithTimeout(
      EXECUCAO_CICLOVIARIA_RELATIONS,
      { cache: "no-cache" },
      15000,
      {},
      onError(EXECUCAO_CICLOVIARIA_RELATIONS),
      2
    )
  ]);

  const allWaysData = apiData || fallbackData;
  const statsData = cycleStructureExecutionStatistics(summaryData?.all || fallbackStats);
  
  const citiesData: any = {};
  if (summaryData?.byCity) {
    Object.entries(summaryData.byCity).forEach(([cityId, cityData]: [string, any]) => {
      // Filtrar apenas cidades da RMR
      if (rmrCityIds.has(cityId)) {
        const cityRelations = relationsData?.[cityId]?.relations || [];
        citiesData[cityId] = {
          id: parseInt(cityId),
          name: cityNamesMap[cityId],
          pdc_feito: cityData.pdc_feito || 0,
          out_pdc: cityData.out_pdc || 0,
          pdc_total: cityData.pdc_total || 0,
          percent: cityData.percent || 0,
          total: (cityData.pdc_feito || 0) + (cityData.out_pdc || 0),
          relations: cityRelations
        };
      }
    });
  }

  const documents = {
    title: 'Documentos e Recursos do PDC',
    cards: [
      {
        title: 'Plano Diretor Cicloviário - Volume 1',
        src: '',
        url: PDC_VOL1_URL,
        text: 'Documento oficial com estudo completo, diagnóstico e diretrizes do plano cicloviário da RMR.',
        icon: 'FileText',
        type: 'document'
      },
      {
        title: 'Plano Diretor Cicloviário - Volume 2',
        src: '',
        url: PDC_VOL2_URL,
        text: 'Mapas detalhados e plantas das rotas cicloviárias projetadas para a região metropolitana.',
        icon: 'Map',
        type: 'document'
      },
      {
        title: 'Pasta Completa do PDC',
        src: '',
        url: PDC_PASTA_URL,
        text: 'Acervo completo com documentos, processo de construção e ação civil pública para implantação.',
        icon: 'FolderOpen',
        type: 'folder'
      },
      {
        title: 'Ciclomapa',
        src: '',
        url: CICLOMAPA_URL,
        text: 'Plataforma colaborativa de monitoramento das ciclovias existentes em diversas cidades brasileiras.',
        icon: 'Bike',
        type: 'external'
      },
      {
        title: 'Podcast: O que é o PDC?',
        src: '',
        url: PDC_PODCAST_URL,
        text: 'Episódio explicativo sobre o Plano Diretor Cicloviário, sua importância e implementação.',
        icon: 'Mic',
        type: 'media'
      },
      {
        title: 'Wiki OpenStreetMap',
        src: '',
        url: PDC_WIKI_URL,
        text: 'Documentação técnica com listagem completa das infraestruturas cicloviárias no OpenStreetMap.',
        icon: 'BookOpen',
        type: 'wiki'
      }
    ]
  };

  return {
    cover: page_data.cover_image_url,
    title1: page_data.ExplanationBoxData.title_1,
    title2: page_data.ExplanationBoxData.title_2,
    description1: page_data.ExplanationBoxData.text_1,
    description2: page_data.ExplanationBoxData.text_2,
    documents,
    layersConf,
    allWaysData,
    statsData,
    citiesData,
    apiDown: apiErrors.length > 0,
    apiErrors
  };
};