import { json, type LoaderFunction } from "@remix-run/node";

export const projetosLoader: LoaderFunction = async () => {
  const API_URL = "https://cms.ameciclo.org";

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
