import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";
import { cmsFetch } from "~/services/cmsFetch";
import { PERFIL_API_URL } from "~/servers";

const MediaSchema = z.object({
  id: z.number().nullish(),
  url: z.string().nullish(),
  alternativeText: z.string().nullish(),
});

const PerfilPageSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  description: z.string().nullish(),
  objective: z.string().nullish(),
  methodology: z.string().nullish(),
  overal_report: z.string().nullish(),
  cover: MediaSchema.nullish(),
});

export type PerfilPage = z.infer<typeof PerfilPageSchema>;

const fetchPerfil = createServerFn().handler(async () => {
  // The Strapi page metadata is fully migrated to strapiClient + Zod.
  // The cyclist-profile Atlas API at PERFIL_API_URL still uses cmsFetch
  // because its runtime shape can't be verified from this dev environment
  // — it lives on a domain that doesn't resolve outside the Cloudflare
  // Worker. Atlas-side schema is a follow-up once we have access to its
  // sample responses (see the migration plan in PR #152's body).
  const [pageRes, profileData] = await Promise.all([
    strapiClient.single("perfil").find({ populate: ["cover"] }),
    cmsFetch<unknown>(PERFIL_API_URL, {
      ttl: 60,
      timeout: 10000,
      fallback: null,
    }),
  ]);

  const page = PerfilPageSchema.parse(pageRes.data);

  return {
    page,
    profileData,
    profileApiDown: profileData == null,
  };
});

export const perfilQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "perfil"],
    queryFn: () => fetchPerfil(),
  });
