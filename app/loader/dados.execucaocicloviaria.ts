import { LoaderFunction } from "@remix-run/node";
import { IntlNumberMax1Digit, IntlPercentil } from "~/services/utils";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { OBSERVATORY_DATA_ALL_WAYS, OBSERVATORY_DATA_WAYS_SUMMARY, CITIES_DATA, OBSERVATORY_DATA } from "~/servers";

export const loader: LoaderFunction = async () => {
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
  }

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
    filter: ["==", "STATUS", "Projeto"],
  };

  const PDCDoneLayer = {
    id: "Executados dentro do PDC",
    type: "line",
    paint: {
      "line-color": "#008080",
      "line-width": 3,
    },
    filter: ["==", "STATUS", "Realizada"],
  };

  const NotPDC = {
    id: "Executados fora do PDC",
    type: "line",
    paint: {
      "line-color": "#DDDF00",
      "line-width": 1.5,
      "line-opacity": 0.8,
    },
    filter: ["==", "STATUS", "NotPDC"],
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

  // Dados mock para fallback
  const mockAllWaysData = { all: { type: "FeatureCollection", features: [] } };
  const mockStatsData = [
    { title: "estrutura cicloviárias existentes", unit: "km", value: "245.8" },
    { title: "projetada no plano cicloviário", unit: "km", value: "654.2" },
    { title: "implantados no plano cicloviário", unit: "km", value: "187.3" },
    { title: "cobertos do plano cicloviário", unit: "%", value: "28.6" }
  ];
  const mockCitiesData = {};

  // Promises assíncronas com timeout
  const allWaysPromise = fetchWithTimeout(
    OBSERVATORY_DATA_ALL_WAYS, 
    { cache: "no-cache" }, 
    15000, 
    mockAllWaysData
  ).then(data => data.all);

  const statsPromise = fetchWithTimeout(
    OBSERVATORY_DATA_WAYS_SUMMARY, 
    { cache: "no-cache" }, 
    15000, 
    { all: { pdc_feito: 187.3, out_pdc: 58.5, pdc_total: 654.2, percent: 28.6 } }
  ).then(data => cycleStructureExecutionStatistics(data.all));

  const citiesPromise = Promise.all([
    fetchWithTimeout(OBSERVATORY_DATA_WAYS_SUMMARY, { cache: "no-cache" }, 15000, { byCity: {} }),
    fetchWithTimeout(CITIES_DATA, {}, 15000, []),
    fetchWithTimeout(OBSERVATORY_DATA, {}, 15000, {})
  ]).then(([summaryData, cities, relations]) => 
    cityCycleStructureExecutionStatisticsByCity(summaryData.byCity, cities, relations)
  );

  const documents = {
    title: 'Documentos e links importantes para o PDC.',
    cards: [
      {
        title: 'Plano Diretor Cicloviário da RMR - vol 1',
        src: '',
        url:
          'https://drive.google.com/file/d/0BxR5Ri6g5X_ZaldIY2tZS1pYRUU/view?usp=share_link&resourcekey=0-qVT9rlnlNOAdE-cs1-fn9A',
        text: 'Documento lançado em 2014, parte principal que contém o estudo.'
      },
      {
        title: 'Plano Diretor Cicloviário da RMR - vol 2',
        src: '',
        url:
          'https://drive.google.com/file/d/0BxR5Ri6g5X_ZaVlpckJQVS1CTlU/view?usp=share_link&resourcekey=0-PjUIH1c2ObtbdTUGuLn28g',
        text: 'Parte 2 do documento, apenas com os mapas.'
      },
      {
        title: 'Pasta do PDC',
        src: '',
        url: 'https://pdc.ameciclo.org',
        text:
          'Pasta em nosso drive com o plano, o processo de construção e a nossa ação civil-pública para a implantação.'
      },
      {
        title: 'Ciclomapa',
        src: '',
        url: 'https://ciclomapa.org.br/',
        text:
          'Mapa colaborativo que monitora as ciclovias de diversas cidades, inclusive a nossa.'
      },
      {
        title: 'O que é o PDC?',
        src: '',
        url: 'https://www.youtube.com/watch?v=LEQlGK-FWnI',
        text: 'Episódio de nosso podcast sobre o Plano Diretor Cicloviário.'
      },
      {
        title: 'Wiki do PDC',
        src: '',
        url: 'https://wiki.openstreetmap.org/w/index.php?title=Plano_Diretor_Ciclovi%C3%A1rio_da_Regi%C3%A3o_Metropolitana_do_Recife',
        text: 'A wiki com a listagem de todas as infras no OpenStreetMaps.'
      }
    ]
  }

  // Aguardar todos os dados no servidor
  const [allWaysData, statsData, citiesData] = await Promise.all([
    allWaysPromise,
    statsPromise,
    citiesPromise
  ]);

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
  };
};