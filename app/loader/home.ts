import { json, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
  let apiDown = false;
  
  const home = await fetchWithTimeout(
    "https://cms.ameciclo.org/home", 
    { cache: "no-cache" }, 
    5000, 
    { projects: [] },
    () => { apiDown = true; }
  );
  
  const projects = await fetchWithTimeout(
    "https://cms.ameciclo.org/projects", 
    { cache: "no-cache" }, 
    5000, 
    [],
    () => { apiDown = true; }
  );

  return json({
    home,
    projects,
    apiDown
  });
};