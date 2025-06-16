import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const response = await fetch("https://cms.ameciclo.org/home");
  if (!response.ok) {
    return json(
      { error: "Failed to fetch data" },
      { status: response.status }
    );
  }

  const home = await response.json();
  const featuredProjects = home.projects || [];

  return json({
    home,
    featuredProjects
  });
};