import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { IntlNumberMax1Digit, IntlPercentil } from "~/services/utils";
import {
  PDC_VOL1_URL,
  PDC_VOL2_URL,
  PDC_PASTA_URL,
  CICLOMAPA_URL,
  PDC_PODCAST_URL,
  PDC_WIKI_URL,
} from "~/servers";

const fetchExecucaoCicloviaria = createServerFn().handler(async () => {
  const page_data = {
    title: "Observatório Cicloviário",
    cover_image_url: "/execucaocicloviaria.png",
    ExplanationBoxData: {
      title_1: "O que é?",
      text_1: `O Observatório Cicloviário é uma central de monitoramento que acompanha a evolução da estrutura cicloviária da Região Metropolitana do Recife, comparando a estrutura projetada pelo Plano Diretor Cicloviário frente à estrutura executada.
            Para facilitar a demonstração dos dados, considera-se EXECUTADA o local onde havia previsão de estrutura e foi implatado algo lá, não necessariamente da mesma tipologia.`,
      title_2: "Por que o PDC?",
      text_2: `Em 4 de fevereiro de 2014 o Governo do Estado de Pernambuco, junto com as prefeituras da Região Metropolitana do Recife, lançou o Plano Diretor Cicloviário (PDC).
            O Plano integra os diversos municípios da RMR com uma ampla rede cicloviária, priorizando as principais avenidas e pontos de conexão das cidades. Sua construção teve participação não só dos entes públicos, mas também da sociedade civil, como nós, da Ameciclo.
            Com metas estipuladas em fases,  o PDC precisa ser concluído em 2024.`,
    },
  };

  const cycleStructureExecutionStatistics = (d: { existingKm: number; plannedKm: number; executedInPdcKm: number; percent: number }) => [
    {
      title: "estrutura cicloviárias existentes",
      unit: "km",
      value: IntlNumberMax1Digit(d.existingKm),
    },
    {
      title: "projetada no plano cicloviário",
      unit: "km",
      value: IntlNumberMax1Digit(d.plannedKm),
    },
    {
      title: "implantados no plano cicloviário",
      unit: "km",
      value: IntlNumberMax1Digit(d.executedInPdcKm),
    },
    {
      title: "cobertos do plano cicloviário",
      unit: "%",
      value: IntlPercentil(d.percent / 100),
    },
  ];

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
    filter: [
      "in",
      "status_type",
      "pdc_realizado_designado",
      "pdc_realizado_nao_designado",
    ],
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

  const { withDb } = await import("~/lib/db.server");
  const { getCyclingOverview, getCyclingProjects, getCyclingHistory } = await import("@ameciclo/db/cycling-read");
  const { overview, projects, history } = await withDb(async (db) => ({
    overview: await getCyclingOverview(db),
    projects: await getCyclingProjects(db),
    history: await getCyclingHistory(db),
  }));

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const statsData = cycleStructureExecutionStatistics(overview.all);

  // The shape the page already reads: kilometres per city, the share as a ratio
  // (0 to 1), and the PDC projects of the city for the table.
  const citiesData = Object.fromEntries(
    overview.cities.map((city) => [
      city.ibge,
      {
        id: city.ibge,
        name: city.name,
        pdc_feito: city.executedInPdcKm,
        out_pdc: city.outsidePdcKm,
        pdc_total: city.plannedKm,
        percent: city.percent / 100,
        total: city.existingKm,
        relations: projects
          .filter((p) => p.cityIbge === city.ibge)
          .map((p) => ({
            name: `${p.name} (${p.ref})`,
            pdc_typology: p.plannedTypology,
            typologies_str: p.builtTypologies || "Nenhuma",
            length: round2(p.plannedKm),
            has_cycleway_length: round2(p.builtKm),
          })),
      },
    ]),
  );

  const documents = {
    title: "Documentos e Recursos do PDC",
    cards: [
      {
        title: "Plano Diretor Cicloviário - Volume 1",
        src: "",
        url: PDC_VOL1_URL,
        text: "Documento oficial com estudo completo, diagnóstico e diretrizes do plano cicloviário da RMR.",
        icon: "FileText",
        type: "document",
      },
      {
        title: "Plano Diretor Cicloviário - Volume 2",
        src: "",
        url: PDC_VOL2_URL,
        text: "Mapas detalhados e plantas das rotas cicloviárias projetadas para a região metropolitana.",
        icon: "Map",
        type: "document",
      },
      {
        title: "Pasta Completa do PDC",
        src: "",
        url: PDC_PASTA_URL,
        text: "Acervo completo com documentos, processo de construção e ação civil pública para implantação.",
        icon: "FolderOpen",
        type: "folder",
      },
      {
        title: "Ciclomapa",
        src: "",
        url: CICLOMAPA_URL,
        text: "Plataforma colaborativa de monitoramento das ciclovias existentes em diversas cidades brasileiras.",
        icon: "Bike",
        type: "external",
      },
      {
        title: "Podcast: O que é o PDC?",
        src: "",
        url: PDC_PODCAST_URL,
        text: "Episódio explicativo sobre o Plano Diretor Cicloviário, sua importância e implementação.",
        icon: "Mic",
        type: "media",
      },
      {
        title: "Wiki OpenStreetMap",
        src: "",
        url: PDC_WIKI_URL,
        text: "Documentação técnica com listagem completa das infraestruturas cicloviárias no OpenStreetMap.",
        icon: "BookOpen",
        type: "wiki",
      },
    ],
  };

  return {
    cover: page_data.cover_image_url,
    title1: page_data.ExplanationBoxData.title_1,
    title2: page_data.ExplanationBoxData.title_2,
    description1: page_data.ExplanationBoxData.text_1,
    description2: page_data.ExplanationBoxData.text_2,
    documents,
    layersConf,
    statsData,
    citiesData,
    updatedAt: overview.updatedAt,
    history,
  };
});

export const execucaoCicloviariaQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "execucaocicloviaria"],
    queryFn: () => fetchExecucaoCicloviaria(),
  });

// The ways of the map come apart from the page (about 0.5 MB, cached at the edge)
// so the numbers do not wait for them.
export const execucaoCicloviariaWaysQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "execucaocicloviaria", "trechos"],
    queryFn: async (): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry>> => {
      const response = await fetch("/api/execucao-cicloviaria/trechos");
      if (!response.ok) throw new Error(`Trechos: HTTP ${response.status}`);
      return response.json();
    },
    staleTime: 5 * 60_000,
  });
