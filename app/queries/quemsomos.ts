import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const MediaSchema = z.object({
  id: z.number().nullish(),
  url: z.string().nullish(),
});

// Spec lists only "ameciclista" | "concelhofiscal" | "coordenacao", but real
// data also contains "conselhofiscal" (the correct PT spelling). Accept both
// so existing entries don't break the parse — see CMS data quality issue.
const AmeciclistaSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  role: z
    .enum(["ameciclista", "concelhofiscal", "conselhofiscal", "coordenacao"])
    .nullish(),
  botmember: z.boolean().nullish(),
  media: MediaSchema.nullish(),
});

const LinksEntrySchema = z.object({
  id: z.number(),
  title: z.string().nullish(),
  link: z.string().nullish(),
});

const QuemSomoSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  definition: z.string().nullish(),
  objective: z.string().nullish(),
  links: z.array(LinksEntrySchema).nullish(),
});

export type Ameciclista = z.infer<typeof AmeciclistaSchema>;
export type QuemSomo = z.infer<typeof QuemSomoSchema>;
export type LinksEntry = z.infer<typeof LinksEntrySchema>;

const fetchQuemSomos = createServerFn().handler(async () => {
  const [ameciclistasRes, quemSomoRes] = await Promise.all([
    strapiClient.collection("ameciclistas").find({
      pagination: { pageSize: 100 },
      populate: ["media"],
    }),
    strapiClient.single("quem-somo").find({
      populate: ["links"],
    }),
  ]);

  const ameciclistas = z
    .array(AmeciclistaSchema)
    .parse(ameciclistasRes.data)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

  const custom = QuemSomoSchema.parse(quemSomoRes.data);

  return {
    pageData: {
      ameciclistas,
      custom,
    },
  };
});

export const quemSomosQueryOptions = () =>
  queryOptions({
    queryKey: ["quemsomos"],
    queryFn: () => fetchQuemSomos(),
  });
