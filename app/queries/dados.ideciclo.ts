import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import { parsePageData } from "~/services/parsePageData";
import {
  IDECICLO_DATA,
  IDECICLO_STRUCTURES_DATA,
  PLATAFORMA_DADOS_PAGE_DATA,
} from "~/servers";

const FALLBACK_PAGE_DATA = {
  title: "Ideciclo",
  coverImage: "/pages_covers/ideciclo-cover.png",
  explanationBoxes: [
    {
      title: "O que é?",
      description: "",
    },
    {
      title: "Para que serve?",
      description: "",
    },
  ],
};

const fetchIdeciclo = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [idecicloData, structuresData, pageDataResponse] = await Promise.all([
    cmsFetch<any>(IDECICLO_DATA, {
      ttl: 60,
      timeout: 30000,
      fallback: [],
      onError: tracker.at(IDECICLO_DATA),
    }),
    cmsFetch<any>(IDECICLO_STRUCTURES_DATA, {
      ttl: 60,
      timeout: 30000,
      fallback: [],
      onError: tracker.at(IDECICLO_STRUCTURES_DATA),
    }),
    cmsFetch<any>(PLATAFORMA_DADOS_PAGE_DATA("ideciclo"), {
      ttl: 600,
      timeout: 30000,
      onError: tracker.at("plataformas-de-dados"),
    }),
  ]);

  const pageData = parsePageData(pageDataResponse, FALLBACK_PAGE_DATA);

  return {
    ideciclo: idecicloData,
    structures: structuresData,
    pageData,
    ...tracker.summary(),
  };
});

export const idecicloQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "ideciclo"],
    queryFn: () => fetchIdeciclo(),
  });
