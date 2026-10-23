import { sql, type SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { relations } from "./relations";
import {
  PERFIL_MIN_CELL,
  PERFIL_MIN_POINT,
  type PerfilCell,
  type PerfilCube,
  type PerfilHistogramCell,
  type PerfilNational,
  type PerfilPoint,
  type PerfilSurveyOption,
} from "./shared";

type Db = NodePgDatabase<typeof relations>;

// Pesquisa Perfil do Ciclista, for the public page. Every query groups and
// counts; none returns an interview.

// Questions answered by choosing an option: [key, column in profile_interview].
const OPTION_QUESTIONS = [
  ["years", "years_using_id"],
  ["needs", "biggest_need_id"],
  ["start", "motivation_start_id"],
  ["continue", "motivation_continue_id"],
  ["issues", "biggest_issue_id"],
  ["age", "age_group_id"],
  ["schooling", "schooling_id"],
  ["income", "income_id"],
  ["area", "area_id"],
  ["previousMode", "previous_mode_id"],
] as const;

// Yes/no questions that only some surveys asked: [key, column]. A survey that
// did not ask has no true answer at all (the column is empty, or false for
// everyone), so it is skipped rather than shown as "0% yes".
const OPTIONAL_YES_NO_QUESTIONS = [
  ["theft", "had_theft"],
  ["harassment", "had_harassment"],
  ["electric", "electric_bike"],
  ["shared", "shared_bike"],
] as const;

// Questions answered with a number of days: [key, column].
const DAYS_QUESTIONS = [
  ["days", "days_per_week"],
  ["workDays", "days_work"],
  ["leisureDays", "days_leisure"],
] as const;

export const COMBINES_LABEL = "Utiliza bicicleta combinada com outro transporte";
export const NO_COMBINE_LABEL = "Não utiliza combinação";

export async function listPerfilSurveys(db: Db): Promise<PerfilSurveyOption[]> {
  const result = await db.execute<PerfilSurveyOption>(sql`
    select s.id, s.year::int as year, s.city, count(i.id)::int as interviews
    from profile_survey s
    left join profile_interview i on i.survey_id = s.id
    group by s.id
    order by s.year desc, s.city`);
  return result.rows;
}

type Row = { q: string; option: string; ord: number; gender: string; race: string; n: number };

// Groups flat rows into per-question cells. Pure, so it can be tested without a database.
export function assembleCube(
  survey: PerfilCube["survey"],
  rows: Row[],
  histogram: PerfilHistogramCell[],
  points: PerfilPoint[] = [],
): PerfilCube {
  const questions: Record<string, PerfilCell[]> = {};
  for (const r of rows) {
    (questions[r.q] ??= []).push({ option: r.option, order: r.ord, gender: r.gender, race: r.race, n: r.n });
  }
  const hasRace = rows.some((r) => r.race !== "Não informada") || histogram.some((h) => h.race !== "Não informada");
  return { survey, questions, histogram, hasRace, minCell: PERFIL_MIN_CELL, points };
}

export async function loadPerfilCube(db: Db, surveyId: number): Promise<PerfilCube | null> {
  const surveys = await db.execute<{ id: number; year: number; city: string; notes: string | null; interviews: number }>(
    sql`select s.id, s.year::int as year, s.city, s.notes,
               (select count(*)::int from profile_interview i where i.survey_id = s.id) as interviews
        from profile_survey s where s.id = ${surveyId}`,
  );
  const survey = surveys.rows[0];
  if (!survey) return null;

  const { rows, histogram } = await loadAnswers(db, sql`i.survey_id = ${surveyId}`);

  const points = await db.execute<PerfilPoint>(sql`
    select p.name, p.latitude, p.longitude, count(*)::int as n,
           (count(*) filter (where g.label = 'Feminino'))::int as women
    from profile_interview i
    join profile_point p on p.id = i.point_id
    left join profile_option g on g.id = i.gender_id
    where i.survey_id = ${surveyId}
    group by p.id
    having count(*) >= ${PERFIL_MIN_POINT}
    order by n desc`);

  return assembleCube(
    { id: survey.id, year: survey.year, city: survey.city, interviews: survey.interviews, notes: survey.notes },
    rows,
    histogram,
    points.rows,
  );
}

// Every city surveyed in one year, as one pool. Null when only one city was
// surveyed, since there is nothing to compare it with.
export async function loadPerfilNational(db: Db, year: number): Promise<PerfilNational | null> {
  const count = await db.execute<{ cities: number }>(
    sql`select count(distinct city)::int as cities from profile_survey where year = ${year}`,
  );
  const cities = count.rows[0]?.cities ?? 0;
  if (cities < 2) return null;
  const { rows } = await loadAnswers(db, sql`i.survey_id in (select id from profile_survey where year = ${year})`);
  return { year, cities, questions: assembleCube({ id: 0, year, city: "", interviews: 0, notes: null }, rows, []).questions };
}

// Counts for every question, crossed by gender and color/race, over the
// interviews that match `where`.
async function loadAnswers(db: Db, where: SQL) {
  // One row per interview, with gender reduced to three groups and the race
  // label ready to group on.
  const base = sql`
    base as (
      select i.*,
        case when g.label in ('Masculino', 'Feminino') then g.label else 'Outro' end as gender_group,
        coalesce(r.label, 'Não informada') as race_label
      from profile_interview i
      left join profile_option g on g.id = i.gender_id
      left join profile_option r on r.id = i.color_race_id
      where ${where}
    )`;

  const optionParts = OPTION_QUESTIONS.map(
    ([key, column]) => sql`
      select ${key}::text as q, o.label as option, o.sort_order::int as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b join profile_option o on o.id = b.${sql.raw(column)}
      group by o.label, o.sort_order, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
  );
  const daysParts = DAYS_QUESTIONS.map(
    ([key, column]) => sql`
      select ${key}::text as q, b.${sql.raw(column)}::text as option, b.${sql.raw(column)}::int as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b where b.${sql.raw(column)} is not null
      group by b.${sql.raw(column)}, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
  );
  const booleanParts = [
    sql`
      select 'collisions'::text as q, case when b.had_collision then 'Sim' else 'Não' end as option,
             case when b.had_collision then 0 else 1 end as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b where b.had_collision is not null
      group by b.had_collision, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
    sql`
      select 'combination'::text as q, case when b.combines_modes then ${COMBINES_LABEL} else ${NO_COMBINE_LABEL} end as option,
             case when b.combines_modes then 0 else 1 end as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b where b.combines_modes is not null
      group by b.combines_modes, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
  ];

  const optionalYesNoParts = OPTIONAL_YES_NO_QUESTIONS.map(
    ([key, column]) => sql`
      select ${key}::text as q, case when b.${sql.raw(column)} then 'Sim' else 'Não' end as option,
             case when b.${sql.raw(column)} then 0 else 1 end as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b
      where b.${sql.raw(column)} is not null and (select coalesce(bool_or(x.${sql.raw(column)}), false) from base x)
      group by b.${sql.raw(column)}, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
  );

  // 2021 only, kept in the interview's `extra` JSON: whether the pandemic
  // changed how often the person rides, and for those who said it did, whether
  // they ride more or less.
  const pandemicParts = [
    sql`
      select 'pandemic'::text as q,
             case when (b.extra->>'pandemic_changed_frequency')::boolean then 'Sim' else 'Não' end as option,
             case when (b.extra->>'pandemic_changed_frequency')::boolean then 0 else 1 end as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b where b.extra ? 'pandemic_changed_frequency'
      group by 2, 3, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
    sql`
      select 'pandemicChange'::text as q, b.extra->>'pandemic_frequency_change' as option,
             case when b.extra->>'pandemic_frequency_change' = 'Passei a pedalar mais' then 0 else 1 end as ord,
             b.gender_group as gender, b.race_label as race, count(*)::int as n
      from base b where b.extra ? 'pandemic_frequency_change'
      group by 2, 3, b.gender_group, b.race_label
      having count(*) >= ${PERFIL_MIN_CELL}`,
  ];

  const cells = await db.execute<Row>(sql`
    with ${base}
    ${sql.join([...optionParts, ...daysParts, ...booleanParts, ...optionalYesNoParts, ...pandemicParts], sql` union all `)}`);

  const histogram = await db.execute<PerfilHistogramCell>(sql`
    with ${base}
    select (b.trip_minutes / 5 * 5)::int as bucket, b.gender_group as gender, b.race_label as race, count(*)::int as n
    from base b
    where b.trip_minutes between 1 and 150
    group by 1, 2, 3
    having count(*) >= ${PERFIL_MIN_CELL}
    order by 1`);

  return { rows: cells.rows, histogram: histogram.rows };
}
