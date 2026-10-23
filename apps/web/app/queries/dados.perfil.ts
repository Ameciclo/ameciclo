import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chooseSurvey } from "@ameciclo/db/perfil-series";
import type { PerfilCube, PerfilNational, PerfilSurveyOption } from "@ameciclo/db/shared";
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

// The survey answers live in the database, as counts only. All editions of a
// city come in one go, so switching year in the page is a local choice and
// never a new request. When the database is unreachable the page falls back to
// its "data unavailable" state.
async function loadPerfilFromDatabase(city: string | undefined) {
  try {
    const { withDb } = await import("~/lib/db.server");
    const { listPerfilSurveys, loadPerfilCube, loadPerfilNational } = await import("@ameciclo/db");
    return await withDb(async (db) => {
      const surveys = await listPerfilSurveys(db);
      const chosen = chooseSurvey(surveys, city, undefined);
      const history: PerfilCube[] = [];
      if (chosen) {
        for (const s of surveys.filter((x) => x.city === chosen.city)) {
          const cube = await loadPerfilCube(db, s.id);
          if (cube) history.push(cube);
        }
        history.sort((a, b) => a.survey.year - b.survey.year);
      }
      // The same questions across every city surveyed in each of those years,
      // to compare the city with the rest of the country.
      const national: PerfilNational[] = [];
      for (const { survey } of history) {
        const pool = await loadPerfilNational(db, survey.year);
        if (pool) national.push(pool);
      }
      return { surveys, history, national };
    });
  } catch (error) {
    console.error("Error loading the perfil survey from the database:", error);
    return null;
  }
}

const fetchPerfilPage = createServerFn({ method: "GET" }).handler(async () => {
  const res = await strapiClient.single("perfil").find({ populate: ["cover"] });
  return PerfilPageSchema.parse(res.data);
});

const fetchPerfilData = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ city: z.string().optional() }).parse(input ?? {}))
  .handler(async ({ data }) => {
    const fromDb = await loadPerfilFromDatabase(data.city);
    const surveys: PerfilSurveyOption[] = fromDb?.surveys ?? [];
    const history: PerfilCube[] = fromDb?.history ?? [];
    const national: PerfilNational[] = fromDb?.national ?? [];
    return { surveys, history, national, dataUnavailable: history.length === 0 };
  });

// The page text rarely changes.
export const perfilPageQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "perfil", "page"],
    queryFn: () => fetchPerfilPage(),
    staleTime: 60 * 60 * 1000,
  });

export const perfilDataQueryOptions = (city?: string) =>
  queryOptions({
    queryKey: ["dados", "perfil", "data", city ?? null],
    queryFn: () => fetchPerfilData({ data: { city } }),
    staleTime: 5 * 60 * 1000,
  });
