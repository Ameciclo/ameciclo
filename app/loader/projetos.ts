import { json, type LoaderFunction } from "@remix-run/node";
import { staticFallbacks } from "~/services/staticFallbacks";

export const projetosLoader: LoaderFunction = async () => {
  return json({
    projectsData: { 
      projects: staticFallbacks.projects.map(p => ({
        ...p,
        name: p.name,
        slug: p.slug,
        status: p.status,
        isHighlighted: p.id <= 6,
        media: { url: '/images/banners/projetos.webp' },
        workgroup: { name: 'Ameciclo' }
      })),
      workgroups: [{ id: '1', name: 'Ameciclo' }],
      error: null
    }
  });
};

export const loader = projetosLoader;

export const projetoLoader: LoaderFunction = async ({ params }) => {
  const { projeto } = params;
  const project = staticFallbacks.projects.find(p => p.slug === projeto);
  
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({
    project: {
      ...project,
      name: project.name,
      description: 'Descrição do projeto em desenvolvimento.',
      media: { url: '/images/banners/projetos.webp' }
    }
  });
};
