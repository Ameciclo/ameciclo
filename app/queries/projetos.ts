import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const MediaSchema = z.object({
  id: z.union([z.string(), z.number()]).nullish(),
  url: z.string().nullish(),
  caption: z.string().nullish(),
});

const WorkgroupSchema = z.object({
  id: z.union([z.string(), z.number()]),
  documentId: z.string().nullish(),
  name: z.string().nullish(),
});

const LinkEntrySchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().nullish(),
  link: z.string().nullish(),
});

const StepEntrySchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().nullish(),
  description: z.string().nullish(),
  link: z.string().nullish(),
  image: MediaSchema.nullish(),
});

const ProductEntrySchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().nullish(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  link: z.string().nullish(),
});

const PartnerSchema = z.object({
  id: z.union([z.string(), z.number()]),
  documentId: z.string().nullish(),
  name: z.string().nullish(),
  logo: z.array(MediaSchema).nullish(),
});

const ProjectListSchema = z.object({
  id: z.union([z.string(), z.number()]),
  documentId: z.string().nullish(),
  name: z.string().nullish(),
  slug: z.string().nullish(),
  project_status: z.enum(["ongoing", "finished", "paused"]).nullish(),
  isHighlighted: z.boolean().nullish(),
  media: MediaSchema.nullish(),
  workgroup: WorkgroupSchema.nullish(),
});

const ProjectDetailSchema = ProjectListSchema.extend({
  description: z.string().nullish(),
  long_description: z.any().nullish(),
  goal: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  showTitle: z.boolean().nullish(),
  bikeCulture: z.enum(["low", "medium", "high"]).nullish(),
  instArticulation: z.enum(["low", "medium", "high"]).nullish(),
  politicIncidence: z.enum(["low", "medium", "high"]).nullish(),
  cover: MediaSchema.nullish(),
  gallery: z.array(MediaSchema).nullish(),
  Links: z.array(LinkEntrySchema).nullish(),
  steps: z.array(StepEntrySchema).nullish(),
  products: z.array(ProductEntrySchema).nullish(),
  partners: z.array(PartnerSchema).nullish(),
});

export type Project = z.infer<typeof ProjectListSchema>;
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
export type Workgroup = z.infer<typeof WorkgroupSchema>;
export type ProjectMedia = z.infer<typeof MediaSchema>;
export type ProjectLink = z.infer<typeof LinkEntrySchema>;
export type ProjectStep = z.infer<typeof StepEntrySchema>;
export type ProjectProduct = z.infer<typeof ProductEntrySchema>;
export type ProjectPartner = z.infer<typeof PartnerSchema>;

const fetchProjetos = createServerFn().handler(async () => {
  const [projectsRes, workgroupsRes] = await Promise.all([
    strapiClient.collection("projects").find({
      pagination: { pageSize: 100 },
      populate: ["media", "workgroup"],
    }),
    strapiClient.collection("workgroups").find({
      pagination: { pageSize: 100 },
    }),
  ]);

  const projects = z.array(ProjectListSchema).parse(projectsRes.data);
  const workgroups = z.array(WorkgroupSchema).parse(workgroupsRes.data);

  return {
    projectsData: { projects, workgroups },
  };
});

export const projetosQueryOptions = () =>
  queryOptions({
    queryKey: ["projetos"],
    queryFn: () => fetchProjetos(),
  });

// Static JSON translation files live on ameciclo.org (same origin as app).
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

async function findProjectBySlug(slug: string) {
  const res = await strapiClient.collection("projects").find({
    filters: { slug: { $eq: slug } },
    populate: {
      media: true,
      cover: true,
      gallery: true,
      workgroup: true,
      products: true,
      Links: true,
      steps: true,
      partners: { populate: "logo" },
    },
  });
  return res.data;
}

const fetchProjeto = createServerFn()
  .inputValidator((input: { projeto: string }) => input)
  .handler(async ({ data: input }) => {
    const projeto = input.projeto;
    const isTranslation =
      projeto?.endsWith("_en") || projeto?.endsWith("_es");

    if (isTranslation) {
      const translationData = await fetchTranslationJson(projeto);
      if (translationData?.data && translationData.data.length > 0) {
        const baseSlug = projeto.replace(/_(en|es)$/, "");
        const project = ProjectDetailSchema.parse(translationData.data[0]);
        const availableTranslations: Array<{ lang: string; slug: string }> = [];

        const ptData = await findProjectBySlug(baseSlug).catch(() => []);
        if (ptData.length > 0) {
          availableTranslations.push({ lang: "pt", slug: baseSlug });
        }
        if (await translationExists(`${baseSlug}_en`)) {
          availableTranslations.push({ lang: "en", slug: `${baseSlug}_en` });
        }
        if (await translationExists(`${baseSlug}_es`)) {
          availableTranslations.push({ lang: "es", slug: `${baseSlug}_es` });
        }

        return { project, availableTranslations };
      }
    }

    const projects = await findProjectBySlug(projeto);
    if (projects.length === 0) {
      throw notFound({ data: { slug: projeto } });
    }

    const project = ProjectDetailSchema.parse(projects[0]);
    const availableTranslations: Array<{ lang: string; slug: string }> = [
      { lang: "pt", slug: projeto },
    ];
    if (await translationExists(`${projeto}_en`)) {
      availableTranslations.push({ lang: "en", slug: `${projeto}_en` });
    }
    if (await translationExists(`${projeto}_es`)) {
      availableTranslations.push({ lang: "es", slug: `${projeto}_es` });
    }

    return { project, availableTranslations };
  });

export const projetoQueryOptions = (projeto: string) =>
  queryOptions({
    queryKey: ["projetos", projeto],
    queryFn: () => fetchProjeto({ data: { projeto } }),
  });
