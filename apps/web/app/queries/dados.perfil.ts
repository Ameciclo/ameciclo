import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chooseSurvey } from "@ameciclo/db/perfil-series";
import type { PerfilCube, PerfilSurveyOption } from "@ameciclo/db/shared";
import { strapiClient } from "~/lib/strapi";

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

const InputSchema = z.object({
  city: z.string().optional(),
  year: z.number().int().optional(),
});

// The survey answers live in the database, as counts only. When it is
// unreachable the page falls back to its "data unavailable" state.
async function loadPerfilFromDatabase(city: string | undefined, year: number | undefined) {
  try {
    const { withDb } = await import("~/lib/db.server");
    const { listPerfilSurveys, loadPerfilCube } = await import("@ameciclo/db");
    return await withDb(async (db) => {
      const surveys = await listPerfilSurveys(db);
      const chosen = chooseSurvey(surveys, city, year);
      const cube = chosen ? await loadPerfilCube(db, chosen.id) : null;
      return { surveys, cube };
    });
  } catch (error) {
    console.error("Error loading the perfil survey from the database:", error);
    return null;
  }
}

const fetchPerfil = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => InputSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const [pageRes, fromDb] = await Promise.all([
      strapiClient.single("perfil").find({ populate: ["cover"] }),
      loadPerfilFromDatabase(data.city, data.year),
    ]);

    const page = PerfilPageSchema.parse(pageRes.data);
    const surveys: PerfilSurveyOption[] = fromDb?.surveys ?? [];
    const cube: PerfilCube | null = fromDb?.cube ?? null;

    return { page, surveys, cube, dataUnavailable: cube === null };
  });

export const perfilQueryOptions = (city?: string, year?: number) =>
  queryOptions({
    queryKey: ["dados", "perfil", city ?? null, year ?? null],
    queryFn: () => fetchPerfil({ data: { city, year } }),
  });
