import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";
import { cmsFetch } from "~/services/cmsFetch";
import { parsePageData } from "~/services/parsePageData";
import { PLATAFORMA_DADOS_PAGE_DATA } from "~/servers";

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

export type DocumentEntry = z.infer<typeof DocumentSchema>;

const FALLBACK_PAGE_DATA = {
  title: "Documentos",
  coverImage: "/pages_covers/documentos.png",
  explanationBoxes: [
    {
      title: "O que acontece por aqui?",
      description:
        "Documentos e publicações sobre mobilidade ativa, cicloativismo e políticas públicas — produzidos pela Ameciclo ou em parceria com outras organizações.",
    },
    {
      title: "E o que mais?",
      description:
        "Compartilhamos referências, estudos, livros e relatórios que contribuem para o debate sobre mobilidade sustentável nas cidades.",
    },
  ],
};

const fetchDocumentos = createServerFn().handler(async () => {
  const [documentsRes, pageDataResponse] = await Promise.all([
    strapiClient.collection("documents").find({
      pagination: { pageSize: 100 },
      populate: ["cover"],
    }),
    cmsFetch<any>(PLATAFORMA_DADOS_PAGE_DATA("documentos"), {
      ttl: 600,
      timeout: 5000,
      fallback: null,
    }),
  ]);

  const documents = z.array(DocumentSchema).parse(documentsRes.data);

  return {
    pageData: parsePageData(pageDataResponse, FALLBACK_PAGE_DATA),
    documents,
  };
});

export const documentosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "documentos"],
    queryFn: () => fetchDocumentos(),
  });
