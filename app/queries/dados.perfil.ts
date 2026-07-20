import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { parsePageData } from "~/services/parsePageData";
import { PERFIL_API_URL, PLATAFORMA_DADOS_PAGE_DATA } from "~/servers";

const FALLBACK_PAGE_DATA = {
  title: "Perfil do Ciclista",
  coverImage: "/pages_covers/perfil.png",
  explanationBoxes: [
    {
      title: "O que é?",
      description:
        "Pesquisa de perfil do ciclista realizada pela Ameciclo para entender quem são, como e por que pedalam na Região Metropolitana do Recife.",
    },
    {
      title: "Para o que serve?",
      description:
        "Compreender quem são os ciclistas e quais suas necessidades é fundamental para propor políticas públicas e ações que incentivem o uso da bicicleta.",
    },
  ],
};

const fetchPerfil = createServerFn().handler(async () => {
  const [pageDataResponse, profileData] = await Promise.all([
    cmsFetch<any>(PLATAFORMA_DADOS_PAGE_DATA("perfil"), {
      ttl: 600,
      timeout: 5000,
      fallback: null,
    }),
    cmsFetch<unknown>(PERFIL_API_URL, {
      ttl: 60,
      timeout: 10000,
      fallback: null,
    }),
  ]);

  return {
    pageData: parsePageData(pageDataResponse, FALLBACK_PAGE_DATA),
    profileData,
    profileApiDown: profileData == null,
  };
});

export const perfilQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "perfil"],
    queryFn: () => fetchPerfil(),
  });
