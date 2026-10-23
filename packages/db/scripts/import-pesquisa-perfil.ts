import { join, resolve } from "node:path";

import { getTableColumns, sql } from "drizzle-orm";

import { type Db, withDb } from "../src";
import { profileInterview, profileOption, profilePoint, profileSurvey } from "../src/schema";
import { loadSurveyDataset } from "../src/survey/dataset";
import { type InterviewDraft, OPTIONS_ONLY_IN_2024, type OptionRef, SURVEY_NOTES } from "../src/survey/transform";

// Imports the Pesquisa Perfil do Ciclista (2015, 2018, 2021, 2024) from CSV
// exports of the research spreadsheets. The files it expects are listed in
// src/survey/dataset.ts (SURVEY_FILES); data/pesquisa-perfil/ is git-ignored.
//
//   pnpm --filter @ameciclo/db db:import-perfil              read, clean, write
//   pnpm --filter @ameciclo/db db:import-perfil -- --dry-run read and report only
//
// Safe to run again: interviews are matched on (survey, source id) and updated
// in place. Everything is written in one transaction, rolled back if the row
// counts afterwards do not match what was read.

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

const dryRun = process.argv.includes("--dry-run");
const dir = resolve(process.env.PERFIL_DIR ?? join(import.meta.dirname, "../../../data/pesquisa-perfil"));
const BATCH = 1000;

const optionKey = (o: OptionRef) => `${o.question}|${o.label}`;

function interviewRow(
  d: InterviewDraft,
  surveyId: number,
  optionId: (o: OptionRef | null) => number | null,
  pointId: (sourceId: number | null) => number | null,
): typeof profileInterview.$inferInsert {
  return {
    surveyId,
    sourceId: d.sourceId,
    interviewedOn: d.interviewedOn,
    weekday: d.weekday,
    pointId: pointId(d.pointSourceId),
    areaId: optionId(d.area),
    neighborhood: d.neighborhood,
    age: d.age,
    ageGroupId: optionId(d.ageGroup),
    genderId: optionId(d.gender),
    schoolingId: optionId(d.schooling),
    incomeId: optionId(d.income),
    colorRaceId: optionId(d.colorRace),
    occupation: d.occupation,
    householdSize: d.householdSize,
    neighborhoodLiving: d.neighborhoodLiving,
    daysPerWeek: d.daysPerWeek,
    daysWork: d.daysWork,
    daysSchool: d.daysSchool,
    daysShopping: d.daysShopping,
    daysLeisure: d.daysLeisure,
    daysStation: d.daysStation,
    yearsUsingId: optionId(d.yearsUsing),
    tripMinutes: d.tripMinutes,
    tripTimeGroupId: optionId(d.tripTimeGroup),
    neighborhoodOrigin: d.neighborhoodOrigin,
    neighborhoodDestiny: d.neighborhoodDestiny,
    sharedBike: d.sharedBike,
    electricBike: d.electricBike,
    combinesModes: d.combinesModes,
    combinationModeId: optionId(d.combinationMode),
    previousModeId: optionId(d.previousMode),
    sharedBikeInfluence: d.sharedBikeInfluence,
    hadCollision: d.hadCollision,
    hadTheft: d.hadTheft,
    hadHarassment: d.hadHarassment,
    biggestIssueId: optionId(d.biggestIssue),
    biggestNeedId: optionId(d.biggestNeed),
    motivationStartId: optionId(d.motivationStart),
    motivationContinueId: optionId(d.motivationContinue),
    covidHouseholdCase: d.covidHouseholdCase,
    extra: d.extra,
  };
}

function report(
  drafts: InterviewDraft[],
  warnings: Map<string, number>,
  dates: { resolved: number; empty: number },
) {
  const surveys = new Set(drafts.map((d) => `${d.year}|${d.city}`));
  const perYear = new Map<number, { n: number; cities: Set<string> }>();
  for (const d of drafts) {
    const y = perYear.get(d.year) ?? { n: 0, cities: new Set<string>() };
    y.n++;
    y.cities.add(d.city);
    perYear.set(d.year, y);
  }
  console.log(`\nInterviews read: ${drafts.length}, ${surveys.size} surveys (year x city)`);
  for (const [year, y] of [...perYear.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${year}: ${y.n} interviews in ${y.cities.size} cities`);
  }
  console.log(`Dates: ${dates.resolved} resolved, ${dates.empty} left empty (missing or ambiguous)`);
  if (warnings.size > 0) {
    console.log("Values left empty because they were invalid or unknown:");
    for (const [k, n] of [...warnings.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(6)}  ${k}`);
    }
  }
}

console.log(`Reading CSVs from ${dir}`);
const data = loadSurveyDataset(dir);
report(data.drafts, data.warnings.counts, data.dates);

if (dryRun) {
  console.log("\n--dry-run: nothing was written.");
} else {
  await withDb(connectionString, async (db: Db) => {
    await db.transaction(async (tx) => {
      // 1. Options (the lookup of choice answers)
      const order = new Map<string, number>();
      const refs = new Map<string, OptionRef & { sort: number }>();
      for (const o of [...data.catalog.options, ...OPTIONS_ONLY_IN_2024]) {
        const k = optionKey(o);
        if (refs.has(k)) continue;
        const n = (order.get(o.question) ?? 0) + 1;
        order.set(o.question, n);
        refs.set(k, { ...o, sort: n });
      }
      await tx
        .insert(profileOption)
        .values([...refs.values()].map((o) => ({ question: o.question, label: o.label, sortOrder: o.sort })))
        .onConflictDoNothing();
      const optionIds = new Map<string, number>();
      for (const o of await tx.select().from(profileOption)) optionIds.set(optionKey(o), o.id);
      const optionId = (o: OptionRef | null) => {
        if (!o) return null;
        const id = optionIds.get(optionKey(o));
        if (id === undefined) throw new Error(`Option not in profile_option: ${optionKey(o)}`);
        return id;
      };

      // 2. Surveys (year x city)
      const surveyInputs = new Map<string, { year: number; city: string; edition: number | null }>();
      for (const d of data.drafts) {
        const k = `${d.year}|${d.city}`;
        const cur = surveyInputs.get(k);
        if (!cur) surveyInputs.set(k, { year: d.year, city: d.city, edition: d.sourceEditionId });
        else if (cur.edition === null) cur.edition = d.sourceEditionId;
      }
      const surveyIds = new Map<string, number>();
      for (const s of surveyInputs.values()) {
        const [row] = await tx
          .insert(profileSurvey)
          .values({ year: s.year, city: s.city, sourceEditionId: s.edition, notes: SURVEY_NOTES[s.year] ?? null })
          .onConflictDoUpdate({
            target: [profileSurvey.year, profileSurvey.city],
            set: { sourceEditionId: s.edition, notes: SURVEY_NOTES[s.year] ?? null, updatedAt: sql`now()` },
          })
          .returning({ id: profileSurvey.id });
        if (!row) throw new Error(`Could not save survey ${s.year} ${s.city}`);
        surveyIds.set(`${s.year}|${s.city}`, row.id);
      }

      // 3. Interview points
      const pointIds = new Map<number, number>();
      for (const p of data.points) {
        const values = { sourceId: p.sourceId, name: p.name, latitude: Number(p.latitude), longitude: Number(p.longitude) };
        const [row] = await tx
          .insert(profilePoint)
          .values(values)
          .onConflictDoUpdate({
            target: profilePoint.sourceId,
            set: { name: values.name, latitude: values.latitude, longitude: values.longitude },
          })
          .returning({ id: profilePoint.id });
        if (row) pointIds.set(p.sourceId, row.id);
      }
      const pointId = (sourceId: number | null) => {
        if (sourceId === null) return null;
        const id = pointIds.get(sourceId);
        if (id === undefined) throw new Error(`Interview point ${sourceId} is not in coordinates.csv`);
        return id;
      };

      // 4. Interviews, in batches, updating rows that already exist
      const keep = new Set(["id", "surveyId", "sourceId", "createdAt"]);
      const set: Record<string, ReturnType<typeof sql.raw>> = {};
      for (const [prop, col] of Object.entries(getTableColumns(profileInterview))) {
        if (keep.has(prop)) continue;
        set[prop] = prop === "updatedAt" ? sql.raw("now()") : sql.raw(`excluded."${col.name}"`);
      }
      for (let i = 0; i < data.drafts.length; i += BATCH) {
        const rows = data.drafts.slice(i, i + BATCH).map((d) => {
          const surveyId = surveyIds.get(`${d.year}|${d.city}`);
          if (surveyId === undefined) throw new Error(`No survey for ${d.year} ${d.city}`);
          return interviewRow(d, surveyId, optionId, pointId);
        });
        await tx
          .insert(profileInterview)
          .values(rows)
          .onConflictDoUpdate({ target: [profileInterview.surveyId, profileInterview.sourceId], set });
      }

      // 5. Verify before committing: the table must hold exactly what was read
      const counted = await tx.execute<{ year: number; city: string; n: number }>(sql`
        select s.year, s.city, count(*)::int as n
        from profile_interview i join profile_survey s on s.id = i.survey_id
        group by s.year, s.city`);
      const inDb = new Map(counted.rows.map((r) => [`${r.year}|${r.city}`, r.n]));
      const expected = new Map<string, number>();
      for (const d of data.drafts) {
        const k = `${d.year}|${d.city}`;
        expected.set(k, (expected.get(k) ?? 0) + 1);
      }
      for (const [k, n] of expected) {
        if (inDb.get(k) !== n) {
          throw new Error(`Row count mismatch for ${k}: read ${n}, database has ${inDb.get(k) ?? 0}. Rolled back.`);
        }
      }
      console.log(`\nSaved ${data.drafts.length} interviews in ${expected.size} surveys. Counts match.`);
    });
  });
}
