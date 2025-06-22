import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ params }) => {
  const { projeto } = params;
  
  if (!projeto) {
    throw new Response("Projeto não encontrado", { status: 404 });
  }

  try {
    const projectsResponse = await fetch("https://cms.ameciclo.org/projects");
    
    if (!projectsResponse.ok) {
      throw new Response("Erro ao carregar projetos", { status: 500 });
    }

    const projects = await projectsResponse.json();
    const project = projects.find((p: any) => p.slug === projeto);
    
    if (!project) {
      throw new Response("Projeto não encontrado", { status: 404 });
    }
    
    return json({ project });
  } catch (error) {
    throw new Response("Erro ao carregar projeto", { status: 500 });
  }
};