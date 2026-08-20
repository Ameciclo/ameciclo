import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import {
  IDECICLO_DATA,
  IDECICLO_STRUCTURES_DATA,
  IDECICLO_PAGE_DATA,
} from "~/servers";

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
    cmsFetch<any>(IDECICLO_PAGE_DATA, {
      ttl: 600,
      timeout: 30000,
      onError: tracker.at(IDECICLO_PAGE_DATA),
    }),
  ]);

  const pageData = pageDataResponse?.data || {
    description: "",
    objective: "",
    methodology: "",
    cover: null,
  };

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
