import { json, LoaderFunctionArgs } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { PROJECTS_LIST_DATA, WORKGROUPS_LIST_DATA, PROJECT_DETAIL_DATA } from "~/servers";
import fs from 'fs/promises';
import path from 'path';

type LoaderFunction = (args: LoaderFunctionArgs) => Promise<Response>;

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

  // Verificar se é uma tradução
  const isTranslation = projeto?.endsWith('_en') || projeto?.endsWith('_es');
  
  if (isTranslation) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', `${projeto}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const translationData = JSON.parse(fileContent);
      
      if (translationData?.data && translationData.data.length > 0) {
        let baseSlug = projeto || '';
        if (baseSlug.endsWith('_en')) baseSlug = baseSlug.replace('_en', '');
        if (baseSlug.endsWith('_es')) baseSlug = baseSlug.replace('_es', '');
        
        const availableTranslations = [];
        
        // Verificar PT
        try {
          const ptRes = await fetchWithTimeout(PROJECT_DETAIL_DATA(baseSlug), {}, 2000, null, () => {});
          if (ptRes?.data && ptRes.data.length > 0) {
            availableTranslations.push({ lang: 'pt', slug: baseSlug });
          }
        } catch {}
        
        // Verificar EN
        try {
          const enPath = path.join(process.cwd(), 'public', 'data', `${baseSlug}_en.json`);
          await fs.access(enPath);
          availableTranslations.push({ lang: 'en', slug: `${baseSlug}_en` });
        } catch {}
        
        // Verificar ES
        try {
          const esPath = path.join(process.cwd(), 'public', 'data', `${baseSlug}_es.json`);
          await fs.access(esPath);
          availableTranslations.push({ lang: 'es', slug: `${baseSlug}_es` });
        } catch {}
        
        return json({
          project: translationData.data[0],
          availableTranslations,
          apiDown: false,
          apiErrors: []
        });
      }
    } catch {}
  }

  const projectUrl = PROJECT_DETAIL_DATA(projeto);
  const projects = await fetchWithTimeout(projectUrl, {}, 3000, null, onError(projectUrl));
  
  if (!projects?.data || projects.data.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }
  
  let baseSlug = projeto || '';
  const availableTranslations = [];
  
  availableTranslations.push({ lang: 'pt', slug: baseSlug });
  
  try {
    const enPath = path.join(process.cwd(), 'public', 'data', `${baseSlug}_en.json`);
    await fs.access(enPath);
    availableTranslations.push({ lang: 'en', slug: `${baseSlug}_en` });
  } catch {}
  
  try {
    const esPath = path.join(process.cwd(), 'public', 'data', `${baseSlug}_es.json`);
    await fs.access(esPath);
    availableTranslations.push({ lang: 'es', slug: `${baseSlug}_es` });
  } catch {}
  
  return json({
    project: projects.data[0],
    availableTranslations,
    apiDown: errors.length > 0,
    apiErrors: errors
  });
};
