import { eq, inArray, sql } from "drizzle-orm";

import { withDb } from "../src";
import { ideCity, ideForm, ideReview, ideSegment } from "../src/schema";

// Development data for the IDECICLO public pages: a few cities with evaluated
// structures. Idempotent: running it again resets these rows to the same values.

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

type Rating = "A" | "B" | "C" | "D";

// Points per rating, as in the IDECICLO form for the ciclovia typology.
const SECTIONS = [
  { key: "A", label: "Planejamento Cicloviário", max: 10, items: [
    { code: "A1", label: "Adequação da tipologia à velocidade/hierarquia", points: { A: 0, D: -100 } },
    { code: "A2", label: "Conectividade da Rede Cicloviária", points: { A: 10, B: 7, C: 4, D: 0 } },
  ] },
  { key: "B", label: "Projeto ao longo da estrutura", max: 35, items: [
    { code: "B1", label: "Espaço útil da Infraestrutura Cicloviária", points: { A: 10, B: 8, C: 4, D: 0 } },
    { code: "B2", label: "Tipo de pavimento", points: { A: 5, B: 3, C: 1, D: 0 } },
    { code: "B3", label: "Delimitação da Infraestrutura", points: { A: 10, B: 6, C: 3, D: 0 } },
    { code: "B4", label: "Identificação do espaço cicloviário", points: { A: 5, B: 3, C: 1, D: 0 } },
    { code: "B5", label: "Acessibilidade relativa ao uso do solo lindeiro", points: { A: 5, B: 3, C: 1, D: 0 } },
    { code: "B7", label: "Situações de risco ao longo da infraestrutura", points: { A: 0, B: -12, C: -24, D: -36 } },
  ] },
  { key: "C", label: "Projeto nas interseções", max: 21, items: [
    { code: "C1", label: "Sinalização horizontal cicloviária nas interseções", points: { A: 7, B: 5, C: 3, D: 0 } },
    { code: "C3", label: "Tratamento dos conflitos com modos motorizados", points: { A: 10, B: 6, C: 3, D: 0 } },
  ] },
  { key: "D", label: "Urbanidade", max: 9, items: [
    { code: "D1", label: "Iluminação", points: { A: 3, B: 2, C: 1, D: 0 } },
    { code: "D2", label: "Conforto térmico", points: { A: 3, B: 2, C: 1, D: 0 } },
    { code: "D3", label: "Mobiliário cicloviário", points: { A: 3, B: 2, C: 1, D: 0 } },
  ] },
  { key: "E", label: "Manutenção da infraestrutura cicloviária", max: 25, items: [
    { code: "E1", label: "Conservação da sinalização horizontal na interseção", points: { A: 7, B: 5, C: 3, D: 0 } },
    { code: "E2", label: "Conservação do pavimento", points: { A: 7, B: 5, C: 1, D: 0 } },
    { code: "E3", label: "Conservação dos elementos de delimitação", points: { A: 6, B: 4, C: 2, D: 0 } },
    { code: "E4", label: "Conservação da identificação do espaço", points: { A: 5, B: 3, C: 1, D: 0 } },
  ] },
] as const;

const RATINGS: Rating[] = ["A", "B", "C", "D"];

function pointsFor(points: Partial<Record<Rating, number>>, rating: Rating) {
  return points[rating] ?? null;
}

// `quality` shifts the ratings: 0 gives mostly A, 3 mostly D.
function evaluate(quality: number, seed: number) {
  const ratings: Record<string, Rating> = {};
  const sections: Record<string, { label: string; score: number; rawScore: number; max: number; items: Record<string, { label: string; rating: Rating; points: number | null; maxPoints: number }> }> = {};
  let total = 0;

  for (const section of SECTIONS) {
    let raw = 0;
    const items: Record<string, { label: string; rating: Rating; points: number | null; maxPoints: number }> = {};
    section.items.forEach((item, index) => {
      const rating = item.code === "A1" ? "A" : (RATINGS[Math.min(3, Math.max(0, quality + ((seed + index) % 2) - (index % 3 === 0 ? 1 : 0)))] ?? "C");
      const points = pointsFor(item.points, rating);
      const maxPoints = Math.max(0, ...Object.values(item.points));
      ratings[item.code] = rating;
      items[item.code] = { label: item.label, rating, points, maxPoints };
      raw += points ?? 0;
    });
    if (section.key === "B" && raw < 0) raw = 0;
    const score = Math.min(raw, section.max);
    sections[section.key] = { label: section.label, score, rawScore: raw, max: section.max, items };
    total += score;
  }
  return { ratings, sections, total: Math.max(0, total) };
}

type SegmentSeed = {
  name: string;
  neighborhood: string;
  type: "Ciclofaixa" | "Ciclovia" | "Ciclorrota" | "Compartilhada";
  classification: "estrutural" | "alimentadora" | "local";
  // [lng, lat] along the street.
  line: [number, number][];
  // null: not evaluated yet.
  quality: number | null;
};

type CitySeed = { id: string; name: string; state: string; roadKm: { estrutural: number; alimentadora: number; local: number }; segments: SegmentSeed[] };

const CITIES: CitySeed[] = [
  {
    id: "2611606",
    name: "Recife",
    state: "PE",
    roadKm: { estrutural: 5.2, alimentadora: 4.5, local: 9 },
    segments: [
      { name: "Avenida Boa Viagem", neighborhood: "Boa Viagem", type: "Ciclofaixa", classification: "estrutural", quality: 1, line: [[-34.8993, -8.1241], [-34.8964, -8.1329], [-34.8932, -8.1416], [-34.8901, -8.1497]] },
      { name: "Avenida Agamenon Magalhães", neighborhood: "Espinheiro", type: "Ciclovia", classification: "estrutural", quality: 0, line: [[-34.8995, -8.0526], [-34.8921, -8.0489], [-34.8838, -8.0447], [-34.8761, -8.0409]] },
      { name: "Rua da Aurora", neighborhood: "Boa Vista", type: "Ciclofaixa", classification: "alimentadora", quality: 2, line: [[-34.8828, -8.0621], [-34.8787, -8.0603], [-34.8746, -8.0584]] },
      { name: "Avenida Parnamirim", neighborhood: "Parnamirim", type: "Ciclorrota", classification: "local", quality: 3, line: [[-34.9089, -8.0371], [-34.9047, -8.0343], [-34.9004, -8.0318]] },
      { name: "Avenida Caxangá", neighborhood: "Cordeiro", type: "Ciclofaixa", classification: "estrutural", quality: null, line: [[-34.9238, -8.0396], [-34.9331, -8.0382], [-34.9427, -8.0371]] },
    ],
  },
  {
    id: "2609600",
    name: "Olinda",
    state: "PE",
    roadKm: { estrutural: 0.9, alimentadora: 0.8, local: 0.1 },
    segments: [
      { name: "Avenida Beira Mar", neighborhood: "Bairro Novo", type: "Ciclovia", classification: "estrutural", quality: 1, line: [[-34.8421, -8.0189], [-34.8392, -8.0128], [-34.8363, -8.0067]] },
      { name: "Avenida Getúlio Vargas", neighborhood: "Varadouro", type: "Ciclofaixa", classification: "alimentadora", quality: 2, line: [[-34.8567, -8.0128], [-34.8531, -8.0102], [-34.8496, -8.0076]] },
      { name: "Rua do Sol", neighborhood: "Carmo", type: "Compartilhada", classification: "local", quality: 3, line: [[-34.8537, -8.0118], [-34.8526, -8.0101]] },
    ],
  },
  {
    id: "4106902",
    name: "Curitiba",
    state: "PR",
    roadKm: { estrutural: 2.5, alimentadora: 1.5, local: 0.5 },
    segments: [
      { name: "Avenida República Argentina", neighborhood: "Água Verde", type: "Ciclovia", classification: "estrutural", quality: 0, line: [[-49.2839, -25.4574], [-49.2791, -25.4651], [-49.2742, -25.4729], [-49.2693, -25.4807]] },
      { name: "Rua Mateus Leme", neighborhood: "São Francisco", type: "Ciclofaixa", classification: "alimentadora", quality: 1, line: [[-49.2742, -25.4217], [-49.2701, -25.4262], [-49.2659, -25.4307]] },
      { name: "Rua Padre Anchieta", neighborhood: "Bigorrilho", type: "Ciclofaixa", classification: "alimentadora", quality: 0, line: [[-49.2913, -25.4379], [-49.2869, -25.4423], [-49.2825, -25.4468]] },
      { name: "Rua Bruno Filgueira", neighborhood: "Batel", type: "Ciclorrota", classification: "local", quality: 2, line: [[-49.2889, -25.4439], [-49.2838, -25.4466]] },
    ],
  },
];

const WEIGHTS = { estrutural: 0.6, alimentadora: 0.25, local: 0.15 };

function lengthKm(line: [number, number][]) {
  let meters = 0;
  for (let i = 1; i < line.length; i++) {
    const [lng1, lat1] = line[i - 1] ?? [0, 0];
    const [lng2, lat2] = line[i] ?? [0, 0];
    const dLat = (lat2 - lat1) * 111_320;
    const dLng = (lng2 - lng1) * 111_320 * Math.cos((lat1 * Math.PI) / 180);
    meters += Math.hypot(dLat, dLng);
  }
  return Math.round(meters) / 1000;
}

await withDb(connectionString, async (db) => {
  const cityIds = CITIES.map((c) => c.id);

  await db.transaction(async (tx) => {
    // Forms go first: they cascade to the reviews, and the segments to the forms.
    await tx.delete(ideSegment).where(inArray(ideSegment.cityId, cityIds));

    for (const city of CITIES) {
      const prepared = city.segments.map((segment, index) => ({ segment, index, km: lengthKm(segment.line), result: segment.quality === null ? null : evaluate(segment.quality, index) }));

      // The stored index, as the results screen would save it.
      let ideciclo = 0;
      for (const key of ["estrutural", "alimentadora", "local"] as const) {
        const contribution = prepared
          .filter((p) => p.segment.classification === key && p.result)
          .reduce((sum, p) => sum + (p.km * (p.result?.total ?? 0)) / 100, 0);
        ideciclo += (contribution / city.roadKm[key]) * WEIGHTS[key];
      }

      const values = {
        name: city.name,
        state: city.state,
        evaluatedKm: Math.round(prepared.filter((p) => p.result).reduce((sum, p) => sum + p.km, 0) * 100) / 100,
        ideciclo: Math.round(ideciclo * 1000) / 1000,
        structuralKm: city.roadKm.estrutural,
        feederKm: city.roadKm.alimentadora,
        localKm: city.roadKm.local,
        showInRanking: true,
        updatedAt: sql`now()`,
      };
      await tx.insert(ideCity).values({ id: city.id, ...values }).onConflictDoUpdate({ target: ideCity.id, set: values });

      for (const { segment, index, km, result } of prepared) {
        const id = `${city.id}_${index + 1}`;
        await tx.insert(ideSegment).values({
          id,
          cityId: city.id,
          name: segment.name,
          type: segment.type,
          length: km,
          neighborhood: segment.neighborhood,
          geometry: { type: "LineString", coordinates: segment.line },
          evaluated: result !== null,
          classification: segment.classification,
        });
        if (!result) continue;

        const formId = `form-${id}`;
        await tx.insert(ideForm).values({
          id: formId,
          segmentId: id,
          cityId: city.id,
          researcher: "Equipe Ameciclo",
          date: new Date("2026-03-14T12:00:00Z"),
          streetName: segment.name,
          neighborhood: segment.neighborhood,
          extension: km * 1000,
          hierarchy: segment.classification,
          intersectionsCount: 4 + index,
          blocksCount: 6 + index,
          responses: {
            segment_name: segment.name,
            road_hierarchy: segment.classification,
            infra_typology: segment.type,
            intersections_count: 4 + index,
            total_score: result.total,
            criterion_ratings: result.ratings,
            score_breakdown: { total: result.total, resolvedRatings: result.ratings, sections: result.sections },
          },
        });
        const band: Rating = result.total >= 75 ? "A" : result.total >= 50 ? "B" : result.total >= 25 ? "C" : "D";
        await tx.insert(ideReview).values({ id: `review-${id}`, formId, ratingName: band, rating: Math.round(result.total), weight: km });
      }
      console.log(`${city.name}: ${prepared.length} segments, index ${values.ideciclo}`);
    }
  });

  const [{ forms }] = await db.select({ forms: sql<number>`count(*)::int` }).from(ideForm).where(inArray(ideForm.cityId, cityIds));
  console.log(`done: ${cityIds.length} cities, ${forms} forms`);
});
