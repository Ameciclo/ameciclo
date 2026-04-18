import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import { PLATAFORM_HOME_PAGE } from "~/servers";

const fetchDados = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const response = await cmsFetch<any>(PLATAFORM_HOME_PAGE, {
    ttl: 600,
    timeout: 5000,
    fallback: null,
    onError: tracker.at(PLATAFORM_HOME_PAGE),
  });

  const data = response?.data || {};
  const { cover, description, partners } = data;
  const summary = tracker.summary();

  return {
    data: {
      cover: cover || null,
      description: description || "",
      partners: partners || [],
      apiDown: summary.apiDown,
    },
    apiDown: summary.apiDown,
    apiErrors: summary.apiErrors,
  };
});

export const dadosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados"],
    queryFn: () => fetchDados(),
  });
