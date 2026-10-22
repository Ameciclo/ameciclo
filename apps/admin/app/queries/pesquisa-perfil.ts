import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";

// Pesquisa Perfil do Ciclista. Everything here is an aggregate: individual
// interviews are never selected.

export type SurveyRow = {
  id: number;
  year: number;
  city: string;
  interviews: number;
  pctWomen: number | null;
  ageAvg: number | null;
  daysPerWeek: number | null;
  tripMinutes: number | null;
  pctSharedBike: number | null;
  pctElectric: number | null;
  pctCombines: number | null;
  pctCollision: number | null;
  pctTheft: number | null;
  pctHarassment: number | null;
};

// Share of "yes" among the people who answered (not among every interview).
const share = (column: string) =>
  sql.raw(`(100.0 * count(*) filter (where i.${column}) / nullif(count(i.${column}), 0))::float8`);

export const listProfileSurveys = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(async (db) => {
    const result = await db.execute<SurveyRow>(sql`
      select
        s.id, s.year::int as year, s.city,
        count(i.id)::int as interviews,
        (100.0 * count(*) filter (where g.label = 'Feminino') / nullif(count(i.gender_id), 0))::float8 as "pctWomen",
        avg(i.age)::float8 as "ageAvg",
        avg(i.days_per_week)::float8 as "daysPerWeek",
        avg(i.trip_minutes)::float8 as "tripMinutes",
        ${share("shared_bike")} as "pctSharedBike",
        ${share("electric_bike")} as "pctElectric",
        ${share("combines_modes")} as "pctCombines",
        ${share("had_collision")} as "pctCollision",
        ${share("had_theft")} as "pctTheft",
        ${share("had_harassment")} as "pctHarassment"
      from profile_survey s
      left join profile_interview i on i.survey_id = s.id
      left join profile_option g on g.id = i.gender_id
      group by s.id
      order by s.year, s.city
    `);
    return result.rows;
  });
});

// Choice questions: [question key in profile_option, column in profile_interview, title]
const DISTRIBUTIONS = [
  ["gender", "gender_id", "Gênero"],
  ["age_group", "age_group_id", "Faixa etária"],
  ["color_race", "color_race_id", "Cor ou raça"],
  ["schooling", "schooling_id", "Escolaridade"],
  ["income", "income_id", "Renda"],
  ["area", "area_id", "Área da entrevista"],
  ["years_using", "years_using_id", "Há quanto tempo pedala"],
  ["trip_time_group", "trip_time_group_id", "Tempo do trajeto"],
  ["transport_mode", "combination_mode_id", "Modo combinado com a bicicleta"],
  ["transport_mode", "previous_mode_id", "Modo usado antes da bicicleta"],
  ["biggest_issue", "biggest_issue_id", "Principal problema"],
  ["biggest_need", "biggest_need_id", "O que faria pedalar mais"],
  ["motivation_start", "motivation_start_id", "Motivo para começar"],
  ["motivation_continue", "motivation_continue_id", "Motivo para continuar"],
] as const;

// Yes/no questions
const FLAGS = [
  ["shared_bike", "Usa bicicleta compartilhada"],
  ["electric_bike", "Bicicleta elétrica"],
  ["combines_modes", "Combina a bicicleta com outro modo"],
  ["shared_bike_influence", "Bicicleta compartilhada influenciou"],
  ["had_collision", "Colisão ou queda recente"],
  ["had_theft", "Furto de bicicleta"],
  ["had_harassment", "Assédio"],
  ["covid_household_case", "Covid no domicílio"],
] as const;

export type Distribution = {
  column: string;
  title: string;
  rows: { label: string; n: number }[];
  answered: number;
};

export type Flag = { key: string; label: string; yes: number; no: number; unknown: number };

export type SurveyDetail = {
  survey: { id: number; year: number; city: string; notes: string | null };
  interviews: number;
  stats: {
    ageAvg: number | null;
    ageMedian: number | null;
    tripAvg: number | null;
    tripMedian: number | null;
    daysAvg: number | null;
    withDate: number;
    withPoint: number;
  };
  days: { days: number; n: number }[];
  flags: Flag[];
  distributions: Distribution[];
  siblings: { id: number; year: number }[];
  // Interview points with how many interviews each held (a count, not interviews).
  points: { id: number; name: string; latitude: number; longitude: number; n: number }[];
};

export const getProfileSurvey = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }): Promise<SurveyDetail | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const surveys = await db.execute<{ id: number; year: number; city: string; notes: string | null }>(
        sql`select id, year::int as year, city, notes from profile_survey where id = ${data.id}`,
      );
      const survey = surveys.rows[0];
      if (!survey) return null;

      const flagColumns = sql.join(
        FLAGS.map(
          ([k]) =>
            sql.raw(
              `count(*) filter (where ${k})::int as "${k}_yes", count(*) filter (where not ${k})::int as "${k}_no"`,
            ),
        ),
        sql`, `,
      );
      const totals = await db.execute<Record<string, number | null>>(sql`
        select
          count(*)::int as total,
          avg(age)::float8 as "ageAvg",
          (percentile_cont(0.5) within group (order by age))::float8 as "ageMedian",
          avg(trip_minutes)::float8 as "tripAvg",
          (percentile_cont(0.5) within group (order by trip_minutes))::float8 as "tripMedian",
          avg(days_per_week)::float8 as "daysAvg",
          count(interviewed_on)::int as "withDate",
          count(point_id)::int as "withPoint",
          ${flagColumns}
        from profile_interview where survey_id = ${data.id}
      `);
      const t = totals.rows[0] ?? {};
      const total = Number(t.total ?? 0);

      const distributionQueries = DISTRIBUTIONS.map(
        ([question, column]) => sql`
          select ${column}::text as "column", o.label, o.sort_order as "sortOrder", count(*)::int as n
          from profile_interview i
          join profile_option o on o.id = i.${sql.raw(column)} and o.question = ${question}
          where i.survey_id = ${data.id}
          group by o.label, o.sort_order`,
      );
      const distributionRows = await db.execute<{ column: string; label: string; sortOrder: number; n: number }>(
        sql.join(distributionQueries, sql` union all `),
      );
      const distributions: Distribution[] = DISTRIBUTIONS.map(([, column, title]) => {
        const rows = distributionRows.rows
          .filter((r) => r.column === column)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((r) => ({ label: r.label, n: r.n }));
        return { column, title, rows, answered: rows.reduce((sum, r) => sum + r.n, 0) };
      }).filter((d) => d.answered > 0);

      const days = await db.execute<{ days: number; n: number }>(sql`
        select days_per_week::int as days, count(*)::int as n
        from profile_interview
        where survey_id = ${data.id} and days_per_week is not null
        group by 1 order by 1`);
      const siblings = await db.execute<{ id: number; year: number }>(sql`
        select id, year::int as year from profile_survey
        where city = ${survey.city} order by year`);
      const points = await db.execute<SurveyDetail["points"][number]>(sql`
        select p.id, p.name, p.latitude, p.longitude, count(*)::int as n
        from profile_interview i
        join profile_point p on p.id = i.point_id
        where i.survey_id = ${data.id}
        group by p.id
        order by n desc`);

      return {
        survey,
        interviews: total,
        stats: {
          ageAvg: (t.ageAvg as number | null) ?? null,
          ageMedian: (t.ageMedian as number | null) ?? null,
          tripAvg: (t.tripAvg as number | null) ?? null,
          tripMedian: (t.tripMedian as number | null) ?? null,
          daysAvg: (t.daysAvg as number | null) ?? null,
          withDate: Number(t.withDate ?? 0),
          withPoint: Number(t.withPoint ?? 0),
        },
        days: days.rows,
        flags: FLAGS.map(([key, label]) => {
          const yes = Number(t[`${key}_yes`] ?? 0);
          const no = Number(t[`${key}_no`] ?? 0);
          return { key, label, yes, no, unknown: total - yes - no };
        }).filter((f) => f.yes + f.no > 0),
        distributions,
        siblings: siblings.rows,
        points: points.rows,
      };
    });
  });

export const profileSurveysQueryOptions = () =>
  queryOptions({ queryKey: ["pesquisa-perfil", "surveys"], queryFn: () => listProfileSurveys() });

export const profileSurveyQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["pesquisa-perfil", "survey", id], queryFn: () => getProfileSurvey({ data: { id } }) });
