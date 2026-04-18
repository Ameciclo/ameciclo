import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import { AMECICLISTAS_DATA, QUEM_SOMOS_DATA } from "~/servers";

const fetchQuemSomos = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [ameciclistas, custom] = await Promise.all([
    cmsFetch<any>(AMECICLISTAS_DATA, {
      ttl: 600,
      timeout: 15000,
      fallback: null,
      onError: tracker.at(AMECICLISTAS_DATA),
    }),
    cmsFetch<any>(QUEM_SOMOS_DATA, {
      ttl: 600,
      timeout: 15000,
      fallback: null,
      onError: tracker.at(QUEM_SOMOS_DATA),
    }),
  ]);

  let processedAmeciclistas: any[] = [];
  let ameciclistasLoading = true;

  if (ameciclistas && Array.isArray(ameciclistas["data"])) {
    processedAmeciclistas = ameciclistas["data"].sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );
    ameciclistasLoading = false;
  }

  let processedCustom: { definition: string; objective: string; links: any[] } = {
    definition: "",
    objective: "",
    links: [],
  };
  let customLoading = true;

  if (custom && custom["data"]) {
    processedCustom = custom["data"];
    customLoading = false;
  }

  return {
    pageData: {
      ameciclistas: processedAmeciclistas,
      custom: processedCustom,
      ameciclistasLoading,
      customLoading,
    },
    apiErrors: tracker.summary().apiErrors,
  };
});

export const quemSomosQueryOptions = () =>
  queryOptions({
    queryKey: ["quemsomos"],
    queryFn: () => fetchQuemSomos(),
  });
