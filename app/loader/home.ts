import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const response = await fetch("https://cms.ameciclo.org/home");
  if (!response.ok) {
    return json({ error: "Strapi error" });
  };

  const home = await response.json();
  return { home };
};
