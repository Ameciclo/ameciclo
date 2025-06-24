import { json, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
  let apiDown = false;
  
  const [home, allProjects] = await Promise.all([
    fetchWithTimeout(
      "https://cms.ameciclo.org/home", 
      { cache: "no-cache" }, 
      5000, 
      { projects: [] },
      () => { apiDown = true; }
    ),
    fetchWithTimeout(
      "https://cms.ameciclo.org/projects", 
      { cache: "no-cache" }, 
      5000, 
      [],
      () => { apiDown = true; }
    )
  ]);
  
  const featuredProjects = home?.projects || [];

  return json({
    home,
    featuredProjects,
    allProjects,
    apiDown
  });
};