import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const MediaSchema = z.object({
  id: z.number().nullish(),
  url: z.string().nullish(),
  alternativeText: z.string().nullish(),
});

const DocumentSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  url: z.string().nullish(),
  type: z.enum(["studies", "books", "other"]).nullish(),
  release_date: z.string().nullish(),
  isOurs: z.boolean().nullish(),
  cover: MediaSchema.nullish(),
});

const DocumentosPageSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  description: z.string().nullish(),
  objectives: z.string().nullish(),
  cover: MediaSchema.nullish(),
});

export type DocumentEntry = z.infer<typeof DocumentSchema>;
export type DocumentosPage = z.infer<typeof DocumentosPageSchema>;

const fetchDocumentos = createServerFn().handler(async () => {
  const [documentsRes, pageRes] = await Promise.all([
    strapiClient.collection("documents").find({
      pagination: { pageSize: 100 },
      populate: ["cover"],
    }),
    strapiClient.single("documento").find({
      populate: ["cover"],
    }),
  ]);

  const documents = z.array(DocumentSchema).parse(documentsRes.data);
  const page = DocumentosPageSchema.parse(pageRes.data);

  return { page, documents };
});

export const documentosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "documentos"],
    queryFn: () => fetchDocumentos(),
  });
