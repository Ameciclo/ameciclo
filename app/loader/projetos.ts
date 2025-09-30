import { json, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

const API_URL = "https://cms.ameciclo.org";

export const projetosLoader: LoaderFunction = async () => {
  try {
    const [projectsRes, workgroupsRes] = await Promise.all([
      fetchWithTimeout(`${API_URL}/projects`, { cache: "no-cache" }, 30000, []),
      fetchWithTimeout(`${API_URL}/workgroups`, { cache: "no-cache" }, 30000, []),
    ]);

    const projects = Array.isArray(projectsRes) ? projectsRes : [];
    const workgroups = Array.isArray(workgroupsRes) ? workgroupsRes : [];
    const error = projects.length === 0 && workgroups.length === 0 ? 'API_ERROR' : null;

    return json({
      projectsData: { projects, workgroups, error }
    });
  } catch (error) {
    console.error("Critical Error in Projetos loader:", error);
    return json({
      projectsData: {
        projects: [],
        workgroups: [],
        error: 'API_ERROR'
      }
    });
  }
};

// Loader para projetos._index.tsx
export const loader = projetosLoader;

// Loader para projetos.$projeto.tsx
export const projetoLoader: LoaderFunction = async ({ params }) => {
  const { projeto } = params;

  try {
    const projects = await fetchWithTimeout(`${API_URL}/projects?slug=${projeto}`, {}, 15000, []);
    if (!projects || projects.length === 0) {
      throw new Response("Not Found", { status: 404 });
    }
    return json({
      project: projects[0]
    });
  } catch (error) {
    console.error(error);
    throw new Response("Not Found", { status: 404 });
  }
};
