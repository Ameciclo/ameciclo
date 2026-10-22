import { describe, expect, it } from "vitest";
import {
  cleanOccupation,
  cleanPlace,
  cleanText,
  inferDateFormat,
  parseDate,
  parseInteger,
  parseYesNo,
} from "./normalize";
import {
  ageGroupFor,
  buildCatalog,
  OPTIONS_ONLY_IN_2024,
  OptionRegistry,
  parsePoints,
  resolveDates,
  supplementFrom,
  transform2024Row,
  transformLegacyRow,
  tripTimeGroupFor,
  Warnings,
} from "./transform";

// Small adapter so the tests read like plain assertions.
interface Assert {
  equal(actual: unknown, expected: unknown): void;
  deepEqual(actual: unknown, expected: unknown): void;
  throws(fn: () => unknown, pattern: RegExp): void;
  ok(value: unknown): asserts value;
}
const assert: Assert = {
  equal: (actual, expected) => expect(actual).toBe(expected),
  deepEqual: (actual, expected) => expect(actual).toEqual(expected),
  throws: (fn, pattern) => expect(fn).toThrow(pattern),
  ok(value): asserts value {
    expect(value).toBeTruthy();
  },
};

const catalogRows = [
  { id: "6", type: "gender", name: "Masculino" },
  { id: "8", type: "gender", name: "Sem resposta" },
  { id: "10", type: "age", name: "de 15 a 24 anos" },
  { id: "22", type: "schooling", name: "Sem resposta" },
  { id: "37", type: "distance_time", name: "até 10 minutos" },
  { id: "52", type: "week_days_total_cat", name: "1" },
  { id: "68", type: "collisions_last_years", name: "Sim" },
  { id: "69", type: "collisions_last_years", name: "Não" },
  { id: "89", type: "motivation_to_continue", name: "É mais rápido e prático" },
  {
    id: "60",
    type: "transportation_mode_cat",
    name: "A pé ou outro modo ativo",
  },
  { id: "18", type: "schooling", name: "Ensino Fundamental" },
  { id: "1", type: "area", name: "Área 1 - Área Central" },
  { id: "43", type: "years_using", name: "Menos de 6 meses" },
  { id: "30", type: "wage", name: "Sem renda" },
  { id: "24", type: "wage", name: "de 1 a 2 salários mínimos" },
  { id: "34", type: "color_race", name: "Parda" },
];

describe("normalize", () => {
  it("cleans text and treats no-answer markers as empty", () => {
    assert.equal(cleanText("  `Testo   Alto "), "Testo Alto");
    assert.equal(cleanText("###"), null);
    assert.equal(cleanText("Sem resposta"), null);
    assert.equal(cleanText("N/A"), null);
    assert.equal(cleanText(""), null);
  });

  it("merges the same place typed in different cases", () => {
    assert.equal(cleanPlace("CENTRO"), "Centro");
    assert.equal(cleanPlace("centro"), "Centro");
    assert.equal(cleanPlace("Boa Viagem"), "Boa Viagem");
    assert.equal(cleanPlace("SÃO JOÃO DE MERITI"), "São João de Meriti");
  });

  it("lowercases occupations", () => {
    assert.equal(cleanOccupation(" Estudante "), "estudante");
  });

  it("parses integers within a range and flags the rest", () => {
    assert.deepEqual(parseInteger("5", 0, 7), { value: 5, bad: false });
    assert.deepEqual(parseInteger("", 0, 7), { value: null, bad: false });
    assert.deepEqual(parseInteger("9", 0, 7), { value: null, bad: true });
    assert.deepEqual(parseInteger("5,5", 0, 7), { value: null, bad: true });
  });

  it("reads yes/no answers", () => {
    assert.equal(parseYesNo("Sim"), true);
    assert.equal(parseYesNo("Não"), false);
    assert.equal(parseYesNo("TRUE"), true);
    assert.equal(parseYesNo("Sem resposta"), null);
    assert.equal(parseYesNo(""), null);
  });

  it("only fills dates it can read without guessing", () => {
    assert.equal(parseDate("17/02/2017", null), "2017-02-17"); // day > 12: unambiguous
    assert.equal(parseDate("11/13/2017", null), "2017-11-13"); // month > 12: unambiguous
    assert.equal(parseDate("10/11/2021", null), null); // ambiguous, no survey format
    assert.equal(parseDate("10/11/2021", "dmy"), "2021-11-10");
    assert.equal(parseDate("10/11/2021", "mdy"), "2021-10-11");
    assert.equal(parseDate("31/02/2021", "dmy"), null); // not a real date
    assert.equal(parseDate("", "dmy"), null);
  });

  it("infers the format of a survey from the dates that settle it", () => {
    assert.equal(inferDateFormat(["10/11/2021", "25/11/2021"]), "dmy");
    assert.equal(inferDateFormat(["10/11/2021", "11/25/2021"]), "mdy");
    assert.equal(inferDateFormat(["10/11/2021"]), null);
  });
});

describe("groups derived from numbers", () => {
  it("age bands", () => {
    assert.equal(ageGroupFor(14).label, "até 14 anos");
    assert.equal(ageGroupFor(15).label, "de 15 a 24 anos");
    assert.equal(ageGroupFor(64).label, "de 55 a 64 anos");
    assert.equal(ageGroupFor(65).label, "65 anos ou mais");
  });

  it("trip time bands", () => {
    assert.equal(tripTimeGroupFor(10).label, "até 10 minutos");
    assert.equal(tripTimeGroupFor(11).label, "mais de 10 até 20 minutos");
    assert.equal(tripTimeGroupFor(60).label, "mais de 30 minutos até 1 hora");
    assert.equal(tripTimeGroupFor(61).label, "mais de 1 hora");
  });
});

describe("catalog", () => {
  it("maps types to questions, keeps no-answers as null, skips unmapped types", () => {
    const catalog = buildCatalog(catalogRows);
    assert.deepEqual(catalog.byId.get("6"), {
      question: "gender",
      label: "Masculino",
    });
    assert.equal(catalog.byId.get("8"), null);
    assert.equal(catalog.byId.get("52"), undefined);
    assert.deepEqual(catalog.byId.get("10"), {
      question: "age_group",
      label: "de 15 a 24 anos",
    });
  });
});

const catalog = buildCatalog(catalogRows);

const legacyRow = {
  year: "2018",
  city_name: "Recife",
  edition_id: "29",
  id: "7",
  date: "17/02/2018",
  weekday: "Sexta-Feira",
  coordinates_id: "",
  area_id: "1",
  neighborhood: "BOA VIAGEM",
  job: "Estudante",
  age: "17",
  age_category_id: "10",
  gender_id: "6",
  schooling_id: "18",
  wage_standard_id: "24",
  color_race_id: "",
  week_usage_total: "5",
  distance_time_id: "40",
  distance_time_category_id: "37",
  years_using_id: "43",
  shared_bicycle: "TRUE",
  collisions_last_years: "68",
  motivation_to_continue: "89",
  transportation_integration_id: "60",
  covid19_frequency_changes: "Passei a pedalar mais",
};
const standardizedRow = {
  year: "2018",
  city: "Recife",
  age: "17",
  combina: "Sim",
  pandemia: "Sim",
};

describe("legacy rows", () => {
  it("maps ids to options and fixes the minutes column", () => {
    const warn = new Warnings();
    const d = transformLegacyRow(legacyRow, standardizedRow, catalog, warn);
    assert.ok(d);
    assert.equal(d.gender?.label, "Masculino");
    assert.equal(d.schooling?.label, "Ensino Fundamental");
    assert.equal(d.income?.label, "de 1 a 2 salários mínimos");
    assert.equal(d.tripMinutes, 40); // the "distance_time_id" column holds minutes
    assert.equal(d.tripTimeGroup?.label, "até 10 minutos"); // the sheet's own category wins
    assert.equal(d.neighborhood, "Boa Viagem");
    assert.equal(d.occupation, "estudante");
    assert.equal(d.weekday, "sexta-feira");
    assert.equal(d.hadCollision, true);
    assert.equal(d.sharedBike, true);
    assert.equal(d.combinesModes, true);
    assert.equal(d.combinationMode?.label, "A pé ou outro modo ativo");
    assert.deepEqual(d.extra, {
      pandemic_frequency_change: "Passei a pedalar mais",
      pandemic_changed_frequency: true,
    });
    assert.equal(warn.counts.size, 0);
  });

  it("leaves a category empty and reports it when an id belongs to another question", () => {
    const warn = new Warnings();
    const d = transformLegacyRow(
      { ...legacyRow, gender_id: "18" },
      standardizedRow,
      catalog,
      warn,
    );
    assert.equal(d?.gender, null);
    assert.equal(
      warn.counts.get("legacy: gender points at a schooling category"),
      1,
    );
  });

  it("treats a no-answer category as empty, without a warning", () => {
    const warn = new Warnings();
    const d = transformLegacyRow(
      { ...legacyRow, gender_id: "8", schooling_id: "22" },
      standardizedRow,
      catalog,
      warn,
    );
    assert.equal(d?.gender, null);
    assert.equal(d?.schooling, null);
    assert.equal(warn.counts.size, 0);
  });

  it("derives the age group when the sheet has none", () => {
    const d = transformLegacyRow(
      { ...legacyRow, age_category_id: "" },
      standardizedRow,
      catalog,
      new Warnings(),
    );
    assert.equal(d?.ageGroup?.label, "de 15 a 24 anos");
  });

  it("refuses to join two sheets that are not the same interview", () => {
    assert.throws(
      () =>
        transformLegacyRow(
          legacyRow,
          { ...standardizedRow, city: "Olinda" },
          catalog,
          new Warnings(),
        ),
      /not aligned/,
    );
  });

  it("skips rows without year, city or id", () => {
    const warn = new Warnings();
    assert.equal(
      transformLegacyRow(
        { ...legacyRow, id: "" },
        standardizedRow,
        catalog,
        warn,
      ),
      null,
    );
    assert.equal(
      warn.counts.get("legacy: row without year/city/id (skipped)"),
      1,
    );
  });

  it("builds the supplement from the standardized sheet", () => {
    const s = supplementFrom({
      "Ano da Pesquisa": "2018",
      Cidade: "Recife",
      Idade: "17",
      Combina: "Sim",
      Pandemia: "",
    });
    assert.deepEqual(s, {
      year: "2018",
      city: "Recife",
      age: "17",
      combina: "Sim",
      pandemia: "",
    });
  });
});

describe("2024 rows", () => {
  const registry = new OptionRegistry([
    ...catalog.options,
    ...OPTIONS_ONLY_IN_2024,
    { question: "income", label: "até 1 salário mínimo" },
  ]);
  const raw = {
    n_quest: "12",
    cidade: "Recife",
    zona: "1",
    dia_semana: "terça-feira",
    data: "17/09/2024",
    bike: "NA",
    eletrica: "Sim",
    qt_dia: "6",
    trabalho: "5",
    escola: "0",
    compras: "",
    lazer: "1",
    estacao: "NA",
    qt_tempo: "menos de 6 meses",
    ql_motivo: "É mais rápido e prático",
    ou_meio: "Não",
    ql_meio: "NA",
    combina: "Sim",
    ql_combina: "A pé",
    ocorrencia_a: "Sim",
    ocorrencia_b: "Não",
    ocorrencia_c: "Sem resposta",
    tempo: "25",
    idade: "30",
    genero: "Masculino",
    escolaridade: "Ensino Fundamental completo",
    raca: "Parda",
    renda: "Entre 1 e 2 salários mínimos",
    oq_frequencia: "Mais segurança pública",
    sistema: "Não",
  };

  it("maps the form labels onto the other waves' options", () => {
    const warn = new Warnings();
    const d = transform2024Row(raw, registry, warn);
    assert.ok(d);
    assert.equal(d.year, 2024);
    assert.equal(d.area?.label, "Área 1 - Área Central");
    assert.equal(d.schooling?.label, "Ensino Fundamental");
    assert.equal(d.income?.label, "de 1 a 2 salários mínimos");
    assert.equal(d.yearsUsing?.label, "Menos de 6 meses");
    assert.equal(d.combinationMode?.label, "A pé ou outro modo ativo");
    assert.equal(d.previousMode, null); // "Não" to using another mode before
    assert.equal(d.biggestNeed?.label, "Mais segurança pública");
    assert.equal(d.ageGroup?.label, "de 25 a 34 anos"); // recalculated from age 30
    assert.equal(d.tripTimeGroup?.label, "mais de 20 até 30 minutos");
    assert.equal(d.hadCollision, true);
    assert.equal(d.hadTheft, false);
    assert.equal(d.hadHarassment, null);
    assert.equal(d.electricBike, true);
    assert.equal(d.sharedBike, false);
    assert.equal(d.daysStation, null);
    assert.equal(warn.counts.size, 0);
  });

  it("reports labels it does not know instead of inventing options", () => {
    const warn = new Warnings();
    const d = transform2024Row({ ...raw, raca: "Marciana" }, registry, warn);
    assert.equal(d?.colorRace, null);
    assert.equal(warn.counts.get('2024: unknown color_race "Marciana"'), 1);
  });

  it("resolves dates per survey", () => {
    const d = transform2024Row(raw, registry, new Warnings());
    assert.ok(d);
    const r = resolveDates([d]);
    assert.equal(d.interviewedOn, "2024-09-17");
    assert.deepEqual(r, { resolved: 1, empty: 0 });
  });
});

describe("interview points", () => {
  it("reads real points and ignores the empty rows after them", () => {
    const points = parsePoints([
      {
        id: "1",
        point: "(-8.05508, -34.88226)",
        name: "Avenida Visconde de Suassuna x Rua do Hospício",
      },
      { id: "", point: "", name: "" },
      { id: "2", point: "not a point", name: "x" },
    ]);
    assert.deepEqual(points, [
      {
        sourceId: 1,
        name: "Avenida Visconde de Suassuna x Rua do Hospício",
        latitude: "-8.05508",
        longitude: "-34.88226",
      },
    ]);
  });
});
