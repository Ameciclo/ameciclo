import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import { HOME_DATA, PROJECTS_DATA } from "~/servers";

const fetchHome = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const FEATURED_PROJECTS_URL = `${PROJECTS_DATA}?filters[isHighlighted][$eq]=true&populate=media&pagination[pageSize]=100`;
  const PROJECTS_URL = `${PROJECTS_DATA}?pagination[pageSize]=100`;

  const [homeData, projectsData, featuredProjectsData] = await Promise.all([
    cmsFetch<any>(HOME_DATA, {
      ttl: 600,
      timeout: 1500,
      onError: tracker.at(HOME_DATA),
    }),
    cmsFetch<any>(PROJECTS_URL, {
      ttl: 600,
      timeout: 1500,
      onError: tracker.at(PROJECTS_DATA),
    }),
    cmsFetch<any>(FEATURED_PROJECTS_URL, {
      ttl: 600,
      timeout: 1500,
      onError: tracker.at(FEATURED_PROJECTS_URL),
    }),
  ]);

  return {
    home: {
      ...homeData?.data,
      projects: featuredProjectsData?.data || [],
    },
    projects: projectsData?.data || null,
    ...tracker.summary(),
  };
});

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ["home"],
    queryFn: () => fetchHome(),
  });
