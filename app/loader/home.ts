import { json, type LoaderFunction } from "@remix-run/node";
import { staticFallbacks } from "~/services/staticFallbacks";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  // Tentar buscar dados reais
  const [homeData, projectsData] = await Promise.all([
    fetchWithTimeout(
      'https://cms.ameciclo.org/home',
      {},
      3000,
      staticFallbacks.home,
      onError('https://cms.ameciclo.org/home')
    ),
    fetchWithTimeout(
      'https://cms.ameciclo.org/projects',
      {},
      3000,
      staticFallbacks.projects,
      onError('https://cms.ameciclo.org/projects')
    )
  ]);

  return json({
    home: homeData || staticFallbacks.home,
    projects: projectsData || staticFallbacks.projects,
    apiDown: errors.length > 0,
    apiErrors: errors
  });
}