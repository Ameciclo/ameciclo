import { json, defer, type LoaderFunction } from "@remix-run/node";

const API_URL = "https://cms.ameciclo.org";

export const projetosLoader: LoaderFunction = async () => {
  try {
    const [projectsRes, workgroupsRes] = await Promise.all([
      fetch(`${API_URL}/projects`).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      }).catch(() => []),
      fetch(`${API_URL}/workgroups`).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch workgroups');
        return res.json();
      }).catch(() => []),
    ]);

    return json({
      projects: Array.isArray(projectsRes) ? projectsRes : [],
      workgroups: Array.isArray(workgroupsRes) ? workgroupsRes : [],
      error: projectsRes.length === 0 && workgroupsRes.length === 0 ? 'API_ERROR' : null
    });
  } catch (error) {
    return json({
      projects: [],
      workgroups: [],
      error: 'API_ERROR'
    });
  }
};

export const loader: LoaderFunction = async ({ params }) => {
  const { projeto } = params;

  const fetchProject = async () => {
    try {
      const response = await fetch(`${API_URL}/projects?slug=${projeto}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${projeto}`);
      }
      const projects = await response.json();
      if (!projects || projects.length === 0) {
        throw new Error(`Project not found: ${projeto}`);
      }
      return projects[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return defer({
    project: fetchProject(),
  });
};
