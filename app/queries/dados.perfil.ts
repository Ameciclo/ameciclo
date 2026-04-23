import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import { PERFIL_PAGE_DATA, PERFIL_API_URL } from "~/servers";

const fetchPerfil = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [strapiResponse, profileData] = await Promise.all([
    cmsFetch<any>(PERFIL_PAGE_DATA, {
      ttl: 300,
      timeout: 5000,
      fallback: null,
      onError: tracker.at(PERFIL_PAGE_DATA),
    }),
    cmsFetch<any>(PERFIL_API_URL, {
      ttl: 60,
      timeout: 10000,
      fallback: null,
      onError: tracker.at(PERFIL_API_URL),
    }),
  ]);

  const data = strapiResponse?.data || {};
  const cover = data.cover || null;
  const description = data.description || "";
  const objective = data.objective || "";

  const summary = tracker.summary();
  // Preserve existing semantics: apiDown only when the PERFIL_API_URL fails.
  const apiDown = summary.apiErrors.some(
    (e) => e.url === PERFIL_API_URL
  );

  return {
    cover,
    description,
    objective,
    profileData,
    apiDown,
    apiErrors: summary.apiErrors,
  };
});

export const perfilQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "perfil"],
    queryFn: () => fetchPerfil(),
  });
