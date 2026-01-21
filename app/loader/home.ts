import { json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { HOME_DATA, PROJECTS_DATA } from "~/servers";

export const loader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const FEATURED_PROJECTS_URL = `${PROJECTS_DATA}?filters[isHighlighted][$eq]=true&populate=media&pagination[pageSize]=100`;

  const [homeData, projectsData, featuredProjectsData] = await Promise.all([
    fetchWithTimeout(
      HOME_DATA,
      { cache: "force-cache" },
      1500,
      null,
      onError(HOME_DATA),
      0
    ),
    fetchWithTimeout(
      `${PROJECTS_DATA}?pagination[pageSize]=100`,
      { cache: "force-cache" },
      1500,
      null,
      onError(PROJECTS_DATA),
      0
    ),
    fetchWithTimeout(
      FEATURED_PROJECTS_URL,
      { cache: "force-cache" },
      1500,
      null,
      onError(FEATURED_PROJECTS_URL),
      0
    )
  ]);

  return json({
    home: {
      ...homeData?.data,
      projects: featuredProjectsData?.data || []
    },
    projects: projectsData?.data || null,
    apiDown: errors.length > 0,
    apiErrors: errors
  });
}