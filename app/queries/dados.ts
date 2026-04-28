import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const MediaSchema = z.object({
  id: z.number(),
  url: z.string().nullish(),
  alternativeText: z.string().nullish(),
});

const PartnerSchema = z.object({
  id: z.number(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  link: z.string().nullish(),
  image: z.array(MediaSchema).nullish(),
});

const DadosPageSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  description: z.string().nullish(),
  cover: MediaSchema.nullish(),
  partners: z.array(PartnerSchema).nullish(),
});

export type DadosPartner = z.infer<typeof PartnerSchema>;
export type DadosPage = z.infer<typeof DadosPageSchema>;

const fetchDados = createServerFn().handler(async () => {
  const res = await strapiClient.single("plataforma-de-dado").find({
    populate: {
      cover: true,
      partners: { populate: "image" },
    },
  });

  const page = DadosPageSchema.parse(res.data);
  return { page };
});

export const dadosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados"],
    queryFn: () => fetchDados(),
  });
