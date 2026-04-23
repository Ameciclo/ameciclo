import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
import {
  PROJECTS_LIST_DATA,
  WORKGROUPS_LIST_DATA,
  PROJECT_DETAIL_DATA,
} from "~/servers";

const fetchProjetos = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [projectsRes, workgroupsRes] = await Promise.all([
    cmsFetch<any>(PROJECTS_LIST_DATA, {
      ttl: 600,
      timeout: 3000,
      fallback: null,
      onError: tracker.at(PROJECTS_LIST_DATA),
    }),
    cmsFetch<any>(WORKGROUPS_LIST_DATA, {
      ttl: 600,
      timeout: 3000,
      fallback: null,
      onError: tracker.at(WORKGROUPS_LIST_DATA),
    }),
  ]);

  const projects = projectsRes?.data || [];
  const workgroups = workgroupsRes?.data || [];

  return {
    projectsData: { projects, workgroups },
    ...tracker.summary(),
  };
});

export const projetosQueryOptions = () =>
  queryOptions({
    queryKey: ["projetos"],
    queryFn: () => fetchProjetos(),
  });

// Static JSON translation files live on ameciclo.org (same origin as app).
// Edge-caching under our own worker is iffy, so use plain fetch.
async function fetchTranslationJson(slug: string) {
  try {
    const response = await fetch(`https://ameciclo.org/data/${slug}.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch {}
  return null;
}

async function translationExists(slug: string) {
  try {
    const res = await fetch(`https://ameciclo.org/data/${slug}.json`, {
      method: "GET",
    });
    return res.ok;
  } catch {
    return false;
  }
}

const fetchProjeto = createServerFn()
  .inputValidator((input: { projeto: string }) => input)
  .handler(async ({ data }) => {
    const tracker = makeApiErrorTracker();
    const projeto = data.projeto;

    const isTranslation =
      projeto?.endsWith("_en") || projeto?.endsWith("_es");

    if (isTranslation) {
      const translationData = await fetchTranslationJson(projeto);

      if (translationData?.data && translationData.data.length > 0) {
        let baseSlug = projeto || "";
        if (baseSlug.endsWith("_en")) baseSlug = baseSlug.replace("_en", "");
        if (baseSlug.endsWith("_es")) baseSlug = baseSlug.replace("_es", "");

        const availableTranslations: Array<{ lang: string; slug: string }> = [];

        // Verificar PT (Strapi)
        try {
          const ptRes = await cmsFetch<any>(PROJECT_DETAIL_DATA(baseSlug), {
            ttl: 600,
            timeout: 2000,
            fallback: null,
          });
          if (ptRes?.data && ptRes.data.length > 0) {
            availableTranslations.push({ lang: "pt", slug: baseSlug });
          }
        } catch {}

        if (await translationExists(`${baseSlug}_en`)) {
          availableTranslations.push({ lang: "en", slug: `${baseSlug}_en` });
        }
        if (await translationExists(`${baseSlug}_es`)) {
          availableTranslations.push({ lang: "es", slug: `${baseSlug}_es` });
        }

        return {
          project: translationData.data[0],
          availableTranslations,
          apiDown: false,
          apiErrors: [],
        };
      }
    }

    const projectUrl = PROJECT_DETAIL_DATA(projeto);
    const projects = await cmsFetch<any>(projectUrl, {
      ttl: 600,
      timeout: 3000,
      fallback: null,
      onError: tracker.at(projectUrl),
    });

    if (!projects?.data || projects.data.length === 0) {
      throw notFound();
    }

    const baseSlug = projeto || "";
    const availableTranslations: Array<{ lang: string; slug: string }> = [
      { lang: "pt", slug: baseSlug },
    ];

    if (await translationExists(`${baseSlug}_en`)) {
      availableTranslations.push({ lang: "en", slug: `${baseSlug}_en` });
    }
    if (await translationExists(`${baseSlug}_es`)) {
      availableTranslations.push({ lang: "es", slug: `${baseSlug}_es` });
    }

    return {
      project: projects.data[0],
      availableTranslations,
      ...tracker.summary(),
    };
  });

export const projetoQueryOptions = (projeto: string) =>
  queryOptions({
    queryKey: ["projetos", projeto],
    queryFn: () => fetchProjeto({ data: { projeto } }),
  });
