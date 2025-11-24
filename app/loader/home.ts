import { json, type LoaderFunction } from "@remix-run/node";
import { staticFallbacks } from "~/services/staticFallbacks";

export const loader: LoaderFunction = async () => {
  // Retorna dados estáticos imediatamente para evitar timeout
  return json({
    home: staticFallbacks.home,
    projects: staticFallbacks.projects,
    apiDown: true // Indica que está usando fallback
  });
}