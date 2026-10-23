import { describe, expect, it } from "vitest";

import { assembleCube } from "./perfil";
import {
  buildSeries,
  chooseSurvey,
  type PerfilChartDef,
  type PerfilSelection,
} from "./perfil-series";
import type { PerfilCell, PerfilSurveyOption } from "./shared";

const cell = (option: string, order: number, gender: string, race: string, n: number): PerfilCell => ({
  option,
  order,
  gender,
  race,
  n,
});

const all: PerfilSelection = { gender: "all", races: [], hasRace: true };

const ageDef: PerfilChartDef = { key: "age", title: "Faixa etária", ordered: true };
const needsDef: PerfilChartDef = { key: "needs", title: "Necessidades" };
const daysDef: PerfilChartDef = { key: "days", title: "Dias", days: [1, 3] };

const ageCells = [
  cell("de 15 a 24 anos", 2, "Feminino", "Parda", 10),
  cell("de 15 a 24 anos", 2, "Masculino", "Parda", 20),
  cell("de 15 a 24 anos", 2, "Masculino", "Branca", 5),
  cell("de 25 a 34 anos", 3, "Feminino", "Parda", 30),
  cell("de 25 a 34 anos", 3, "Masculino", "Branca", 7),
  cell("de 25 a 34 anos", 3, "Masculino", "Não informada", 99),
];

describe("buildSeries", () => {
  it("makes one series per color/race and adds up genders", () => {
    const series = buildSeries(ageCells, ageDef, all);
    expect(series.map((s) => s.name)).toEqual(["Branca", "Parda"]);
    const parda = series.find((s) => s.name === "Parda");
    expect(parda?.data).toEqual([
      { name: "de 15 a 24 anos", y: 30 },
      { name: "de 25 a 34 anos", y: 30 },
    ]);
  });

  it("leaves out people whose color/race is not known", () => {
    const series = buildSeries(ageCells, ageDef, all);
    const total = series.flatMap((s) => s.data).reduce((sum, d) => sum + d.y, 0);
    expect(total).toBe(10 + 20 + 5 + 30 + 7); // not the 99
  });

  it("filters by gender", () => {
    const series = buildSeries(ageCells, ageDef, { ...all, gender: "Feminino" });
    expect(series.map((s) => s.name)).toEqual(["Parda"]);
    expect(series[0]?.data).toEqual([
      { name: "de 15 a 24 anos", y: 10 },
      { name: "de 25 a 34 anos", y: 30 },
    ]);
  });

  it("restricts to the chosen races", () => {
    const series = buildSeries(ageCells, ageDef, { ...all, races: ["Branca"] });
    expect(series.map((s) => s.name)).toEqual(["Branca"]);
  });

  it("keeps natural order for ordered questions and sorts by size for the others", () => {
    const cells = [cell("b", 1, "Masculino", "Parda", 5), cell("a", 2, "Masculino", "Parda", 50)];
    expect(buildSeries(cells, { key: "x", title: "x", ordered: true }, all)[0]?.data.map((d) => d.name)).toEqual(["b", "a"]);
    expect(buildSeries(cells, needsDef, all)[0]?.data.map((d) => d.name)).toEqual(["a", "b"]);
  });

  it("shows only the ten biggest options", () => {
    const cells = Array.from({ length: 14 }, (_, i) => cell(`opção ${i}`, i, "Masculino", "Parda", 100 - i));
    const data = buildSeries(cells, needsDef, all)[0]?.data ?? [];
    expect(data).toHaveLength(10);
    expect(data[0]?.name).toBe("opção 0");
  });

  it("lays out a days question over every day in range, including empty ones", () => {
    const cells = [cell("1", 1, "Masculino", "Parda", 6), cell("3", 3, "Feminino", "Parda", 9)];
    expect(buildSeries(cells, daysDef, all)[0]?.data).toEqual([
      { name: "1 dia", y: 6 },
      { name: "2 dias", y: 0 },
      { name: "3 dias", y: 9 },
    ]);
  });

  it("puts everyone in one series when the survey has no color/race", () => {
    const cells = [cell("x", 1, "Masculino", "Não informada", 8), cell("x", 1, "Feminino", "Não informada", 4)];
    const series = buildSeries(cells, needsDef, { gender: "all", races: [], hasRace: false });
    expect(series).toEqual([{ name: "Todos", data: [{ name: "x", y: 12 }] }]);
  });

  it("ignores the race chips when the survey has no color/race", () => {
    const cells = [cell("x", 1, "Masculino", "Não informada", 8)];
    const series = buildSeries(cells, needsDef, { gender: "all", races: ["Parda"], hasRace: false });
    expect(series[0]?.data[0]?.y).toBe(8);
  });

  it("returns nothing when no cell matches", () => {
    expect(buildSeries(ageCells, ageDef, { ...all, races: ["Indígena"] })).toEqual([]);
    expect(buildSeries([], ageDef, all)).toEqual([]);
  });
});

describe("chooseSurvey", () => {
  const surveys: PerfilSurveyOption[] = [
    { id: 4, year: 2024, city: "Recife", interviews: 750 },
    { id: 3, year: 2021, city: "Recife", interviews: 753 },
    { id: 2, year: 2021, city: "Salvador", interviews: 769 },
    { id: 1, year: 2015, city: "Salvador", interviews: 451 },
  ];

  it("defaults to Recife's latest survey", () => {
    expect(chooseSurvey(surveys, undefined, undefined)?.id).toBe(4);
  });

  it("picks the requested city and year", () => {
    expect(chooseSurvey(surveys, "Salvador", 2015)?.id).toBe(1);
  });

  it("uses a city's latest survey when the year is missing or unknown", () => {
    expect(chooseSurvey(surveys, "Salvador", undefined)?.id).toBe(2);
    expect(chooseSurvey(surveys, "Salvador", 1999)?.id).toBe(2);
  });

  it("falls back to Recife for an unknown city", () => {
    expect(chooseSurvey(surveys, "Atlantis", 2021)?.id).toBe(3);
  });

  it("falls back to any survey when Recife is missing, and to null when there are none", () => {
    expect(chooseSurvey(surveys.filter((s) => s.city !== "Recife"), undefined, undefined)?.id).toBe(2);
    expect(chooseSurvey([], "Recife", 2024)).toBeNull();
  });
});

describe("assembleCube", () => {
  const survey = { id: 1, year: 2021, city: "Recife", interviews: 10, notes: null };

  it("groups rows by question", () => {
    const cube = assembleCube(
      survey,
      [
        { q: "age", option: "a", ord: 1, gender: "Masculino", race: "Parda", n: 6 },
        { q: "age", option: "b", ord: 2, gender: "Masculino", race: "Parda", n: 5 },
        { q: "days", option: "5", ord: 5, gender: "Feminino", race: "Branca", n: 7 },
      ],
      [],
    );
    expect(Object.keys(cube.questions).sort()).toEqual(["age", "days"]);
    expect(cube.questions.age).toHaveLength(2);
    expect(cube.hasRace).toBe(true);
    expect(cube.minCell).toBe(5);
  });

  it("knows when a survey has no color/race", () => {
    const cube = assembleCube(
      survey,
      [{ q: "age", option: "a", ord: 1, gender: "Masculino", race: "Não informada", n: 6 }],
      [{ bucket: 0, gender: "Masculino", race: "Não informada", n: 6 }],
    );
    expect(cube.hasRace).toBe(false);
  });
});
