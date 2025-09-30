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

  const homeResult = await fetchWithTimeout(
    "https://cms.ameciclo.org/home",
    { cache: "no-cache" },
    8000,
    staticFallbacks.home,
    () => { apiDown = true; },
    2
  );

  const projectsResult = await fetchWithTimeout(
    "https://cms.ameciclo.org/projects",
    { cache: "no-cache" },
    8000,
    staticFallbacks.projects,
    () => { apiDown = true; },
    2
  );

  const home = homeResult;
  const projects = projectsResult;

  // Cache será controlado pelo frontend
  // if (homeResult && Object.keys(homeResult).length > 0) {
  //   cache.set('home', homeResult, 15);
  // }

  apiDown = !homeResult;

  return json({
    home,
    projects,
    apiDown
  });
}