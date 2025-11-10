import { json, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { cache } from "~/services/cache";
import { staticFallbacks } from "~/services/staticFallbacks";

export const loader: LoaderFunction = async () => {
  let apiDown = false;

  // Verifica cache primeiro
  const cachedHome = cache.get('home');
  if (cachedHome) {
    return json({
      home: cachedHome,
      projects: staticFallbacks.projects,
      apiDown: false
    });
  }

  // Executa requisições em paralelo com timeout reduzido
  const [homeResult, projectsResult] = await Promise.allSettled([
    fetchWithTimeout(
      "https://cms.ameciclo.org/home",
      { cache: "no-cache" },
      5000,
      staticFallbacks.home,
      () => { apiDown = true; },
      1
    ),
    fetchWithTimeout(
      "https://cms.ameciclo.org/projects",
      { cache: "no-cache" },
      5000,
      staticFallbacks.projects,
      () => { apiDown = true; },
      1
    )
  ]);

  const home = homeResult.status === 'fulfilled' ? homeResult.value : staticFallbacks.home;
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : staticFallbacks.projects;

  // Cache dados válidos
  if (home && Object.keys(home).length > 0 && home !== staticFallbacks.home) {
    cache.set('home', home, 10);
  }

  apiDown = homeResult.status === 'rejected' || projectsResult.status === 'rejected';

  return json({
    home,
    projects,
    apiDown
  });
}