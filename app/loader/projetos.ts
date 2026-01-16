import { json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { PROJECTS_LIST_DATA, WORKGROUPS_LIST_DATA, PROJECT_DETAIL_DATA } from "~/servers";

export const projetosLoader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const [projectsRes, workgroupsRes] = await Promise.all([
    fetchWithTimeout(PROJECTS_LIST_DATA, { cache: "no-cache" }, 3000, null, onError(PROJECTS_LIST_DATA)),
    fetchWithTimeout(WORKGROUPS_LIST_DATA, { cache: "no-cache" }, 3000, null, onError(WORKGROUPS_LIST_DATA)),
  ]);

  const projects = projectsRes?.data || [];
  const workgroups = workgroupsRes?.data || [];

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

  const projectUrl = PROJECT_DETAIL_DATA(projeto);
  const projects = await fetchWithTimeout(projectUrl, {}, 3000, null, onError(projectUrl));
  
  if (!projects?.data || projects.data.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({
    project: projects.data[0],
    apiDown: errors.length > 0,
    apiErrors: errors
  });
};
