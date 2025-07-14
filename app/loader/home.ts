import { defer, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
  let apiDown = false;
  
  const homePromise = fetchWithTimeout(
    "https://cms.ameciclo.org/home", 
    { cache: "no-cache" }, 
    5000, 
    { projects: [] },
    () => { apiDown = true; }
  );
  
  const projectsPromise = fetchWithTimeout(
    "https://cms.ameciclo.org/projects", 
    { cache: "no-cache" }, 
    5000, 
    [],
    () => { apiDown = true; }
  );

  return defer({
    homePromise,
    projectsPromise,
    apiDown
  });
};