import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const [homeResponse, projectsResponse] = await Promise.all([
    fetch("https://cms.ameciclo.org/home"),
    fetch("https://cms.ameciclo.org/projects")
  ]);
  
  if (!homeResponse.ok) {
    return json(
      { error: "Failed to fetch home data" },
      { status: homeResponse.status }
    );
  }

  const home = await homeResponse.json();
  const featuredProjects = home.projects || [];
  const allProjects = projectsResponse.ok ? await projectsResponse.json() : [];

  return json({
    home,
    featuredProjects,
    allProjects
  });
};