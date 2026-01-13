import { json, type LoaderFunction } from "@remix-run/node";
import { staticFallbacks } from "~/services/staticFallbacks";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { CMS_BASE_URL, PROJECTS_DATA } from "~/servers";

export const loader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const HOME_URL = `${CMS_BASE_URL}/home`;

  // Tentar buscar dados reais
  const [homeData, projectsData] = await Promise.all([
    fetchWithTimeout(
      HOME_URL,
      {},
      3000,
      staticFallbacks.home,
      onError(HOME_URL)
    ),
    fetchWithTimeout(
      PROJECTS_DATA,
      {},
      3000,
      staticFallbacks.projects,
      onError(PROJECTS_DATA)
    )
  ]);

  return json({
    home: homeData || staticFallbacks.home,
    projects: projectsData || staticFallbacks.projects,
    apiDown: errors.length > 0,
    apiErrors: errors
  });
}