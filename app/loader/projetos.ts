import { json, type LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { PROJECTS_DATA, WORKGROUPS_DATA, CMS_BASE_URL } from "~/servers";

export const projetosLoader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const [projectsRes, workgroupsRes] = await Promise.all([
    fetchWithTimeout(PROJECTS_DATA, { cache: "no-cache" }, 3000, [], onError(PROJECTS_DATA)),
    fetchWithTimeout(WORKGROUPS_DATA, { cache: "no-cache" }, 3000, [], onError(WORKGROUPS_DATA)),
  ]);

  const projects = Array.isArray(projectsRes) ? projectsRes : [];
  const workgroups = Array.isArray(workgroupsRes) ? workgroupsRes : [];

  return json({
    projectsData: { projects, workgroups },
    apiDown: errors.length > 0,
    apiErrors: errors
  });
};

// Loader para projetos._index.tsx
export const loader = projetosLoader;

export const projetoLoader: LoaderFunction = async ({ params }) => {
  const { projeto } = params;
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const projects = await fetchWithTimeout(`${CMS_BASE_URL}/projects?slug=${projeto}`, {}, 3000, [], onError(`${CMS_BASE_URL}/projects?slug=${projeto}`));
  
  if (!projects || projects.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({
    project: projects[0],
    apiDown: errors.length > 0,
    apiErrors: errors
  });
};
