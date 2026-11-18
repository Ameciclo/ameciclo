import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  PDC_VOL1_URL,
  PDC_VOL2_URL,
  PDC_PASTA_URL,
  CICLOMAPA_URL,
  PDC_PODCAST_URL,
  PDC_WIKI_URL,
} from "~/servers";

// Recife opens first when the address names no (or an unknown) municipality.
export const DEFAULT_CITY_IBGE = 2611606;

const fetchExecucaoCicloviaria = createServerFn().handler(async () => {
  const explanations = [
    {
      label: "O que é?",
      text: `O Observatório Cicloviário é uma central de monitoramento que acompanha a evolução da estrutura cicloviária da Região Metropolitana do Recife, comparando a estrutura projetada pelo Plano Diretor Cicloviário frente à estrutura executada.
            Para facilitar a demonstração dos dados, considera-se EXECUTADA o local onde havia previsão de estrutura e foi implantado algo lá, não necessariamente da mesma tipologia.`,
    },
    {
      label: "Por que o PDC?",
      text: `Em 4 de fevereiro de 2014 o Governo do Estado de Pernambuco, junto com as prefeituras da Região Metropolitana do Recife, lançou o Plano Diretor Cicloviário (PDC).
            O Plano integra os diversos municípios da RMR com uma ampla rede cicloviária, priorizando as principais avenidas e pontos de conexão das cidades. Sua construção teve participação não só dos entes públicos, mas também da sociedade civil, como nós, da Ameciclo.
            Com metas estipuladas em fases, o PDC tinha prazo de conclusão em 2024. O observatório mostra quanto dele saiu do papel até hoje.`,
    },
  ];

  const { withDb } = await import("~/lib/db.server");
  const { getCyclingOverview, getCyclingProjects, getCyclingHistory } = await import("@ameciclo/db/cycling-read");
  const { overview, projects, history } = await withDb(async (db) => ({
    overview: await getCyclingOverview(db),
    projects: await getCyclingProjects(db),
    history: await getCyclingHistory(db),
  }));

  const documents = {
    title: "Documentos e recursos do PDC",
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
    title: "Execução do Plano Diretor Cicloviário",
    cover: "/execucaocicloviaria.png",
    explanations,
    documents,
    overview,
    projects,
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
