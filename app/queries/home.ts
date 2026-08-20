import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const MediaSchema = z.object({
  url: z.string().nullish(),
});

const HomeSchema = z.object({
  participation_url: z.string().nullish(),
  association_url: z.string().nullish(),
  donate_url: z.string().nullish(),
});

const ProjectSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  slug: z.string().nullish(),
  project_status: z.enum(["ongoing", "finished", "paused"]).nullish(),
  isHighlighted: z.boolean().nullish(),
  media: MediaSchema.nullish(),
});

export type Home = z.infer<typeof HomeSchema>;
export type Project = z.infer<typeof ProjectSchema>;

const fetchHome = createServerFn().handler(async () => {
  const [homeResult, projectsResult, featuredResult] = await Promise.all([
    strapiClient.single("home").find(),
    strapiClient.collection("projects").find({ pagination: { pageSize: 100 } }),
    strapiClient.collection("projects").find({
      filters: { isHighlighted: { $eq: true } },
      populate: ["media"],
      pagination: { pageSize: 100 },
    }),
  ]);

  const home = HomeSchema.parse(homeResult.data);
  const projects = z.array(ProjectSchema).parse(projectsResult.data);
  const featured = z.array(ProjectSchema).parse(featuredResult.data);

  return {
    home: { ...home, projects: featured },
    projects,
  };
});

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ["home"],
    queryFn: () => fetchHome(),
  });
