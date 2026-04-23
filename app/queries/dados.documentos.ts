import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { DOCUMENTS_DATA, DOCUMENTS_PAGE } from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";

const fetchDocumentos = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  try {
    const [documentsResponse, pageResponse] = await Promise.all([
      cmsFetch<any>(DOCUMENTS_DATA, {
        ttl: 600,
        timeout: 5000,
        onError: tracker.at(DOCUMENTS_DATA),
      }),
      cmsFetch<any>(DOCUMENTS_PAGE, {
        ttl: 600,
        timeout: 5000,
        onError: tracker.at(DOCUMENTS_PAGE),
      }),
    ]);

    type document = {
      title: string;
      description: string;
      url: string;
      type: string;
      release_date: string;
      cover: any;
      coverAlt?: string;
    };

    const documentsData = documentsResponse?.data || [];
    const pageData = pageResponse?.data || {
      cover: null,
      description: null,
      objectives: null,
    };

    const documents: document[] = documentsData.map((doc: any) => {
      return {
        ...doc,
        cover: doc.cover?.url || null,
        coverAlt: doc.cover?.alternativeText || doc.cover?.alt || null,
      };
    });

    return {
      cover: pageData.cover || null,
      description: pageData.description || null,
      objectives: pageData.objectives || null,
      documents,
      ...tracker.summary(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      cover: null,
      description: null,
      objectives: null,
      documents: [],
      apiDown: true,
      apiErrors: [{ url: "DOCUMENTS_API", error: errorMessage || "Erro desconhecido" }],
    };
  }
});

export const documentosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "documentos"],
    queryFn: () => fetchDocumentos(),
  });
