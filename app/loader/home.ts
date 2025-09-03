import { defer, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
  let apiDown = false;
  
  try {
    const [homeResult, projectsResult] = await Promise.allSettled([
      fetchWithTimeout(
        "https://cms.ameciclo.org/home", 
        { cache: "no-cache" }, 
        10000, 
        { projects: [] }
      ),
      fetchWithTimeout(
        "https://cms.ameciclo.org/projects", 
        { cache: "no-cache" }, 
        10000, 
        []
      )
    ]);
    
    const home = homeResult.status === 'fulfilled' ? homeResult.value : { projects: [] };
    const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
    
    apiDown = homeResult.status === 'rejected' || projectsResult.status === 'rejected';
    
    return defer({
      homePromise: Promise.resolve(home),
      projectsPromise: Promise.resolve(projects),
      apiDown
    });
  } catch (error) {
    return defer({
      homePromise: Promise.resolve({ projects: [] }),
      projectsPromise: Promise.resolve([]),
      apiDown: true
    });
  }
};