import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StreetCategoryRow, StreetGeometry, UnsafeStreet, UnsafeStreets, UnsafeStreetsYear } from "@ameciclo/db";
import { slugify } from "~/utils/slugify";

// Vias inseguras: os chamados do SAMU por sinistro de trânsito no Recife, contados por via, do banco. Tudo são
// contagens e traçados de via: nenhum chamado individual sai do servidor.

// As vias que aparecem no mapa (o ranking tem mais; o traçado de todas pesaria demais).
export const MAP_STREETS = 50;
export const RANKING_STREETS = 150;

export type ViasView = UnsafeStreets & {
  // Traçado das primeiras MAP_STREETS vias do ranking, por chave.
  geometries: Record<string, StreetGeometry["geometry"]>;
};

const ViasInput = z.object({ from: z.number().int().optional(), to: z.number().int().optional() });

const fetchVias = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ViasInput.parse(input))
  .handler(async ({ data }): Promise<{ view: ViasView | null }> => {
    try {
      const { withDb } = await import("~/lib/db.server");
      const { getStreetGeometries, getUnsafeStreets } = await import("@ameciclo/db");
      return await withDb(async (db) => {
        const ranking = await getUnsafeStreets(db, { from: data.from, to: data.to, limit: RANKING_STREETS });
        if (ranking.years.length === 0) return { view: null };
        const geometries = await getStreetGeometries(db, ranking.streets.slice(0, MAP_STREETS).map((s) => s.key));
        return { view: { ...ranking, geometries: Object.fromEntries(geometries.map((g) => [g.key, g.geometry])) } };
      });
    } catch (error) {
      console.error("Error loading the unsafe streets from the database:", error);
      return { view: null };
    }
  });

export const viasQueryOptions = (input: z.infer<typeof ViasInput>) =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras", input],
    queryFn: () => fetchVias({ data: input }),
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

// ?de=2020&ate=2024: o que faltar ou não existir volta ao período inteiro.
export function resolveViasPeriod(years: UnsafeStreetsYear[], search: { de?: number; ate?: number }) {
  const list = years.map((y) => y.year);
  const first = list[0] ?? 0;
  const last = list[list.length - 1] ?? 0;
  const from = search.de && list.includes(search.de) ? search.de : first;
  const to = search.ate && list.includes(search.ate) ? Math.max(search.ate, from) : last;
  return { from, to };
}

export const isPartialYear = (y: UnsafeStreetsYear) => y.months < 12;

// ---- Uma via -------------------------------------------------------------------------------------------------

export type ViaView = {
  street: UnsafeStreet;
  rankOverall: number;
  years: UnsafeStreetsYear[];
  categories: StreetCategoryRow[];
  geometry: StreetGeometry["geometry"] | null;
};

const SlugInput = z.object({ slug: z.string().min(1).max(200) });

const fetchVia = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SlugInput.parse(input))
  .handler(async ({ data }): Promise<{ via: ViaView | null; unavailable: boolean }> => {
    try {
      const { withDb } = await import("~/lib/db.server");
      const { getStreetDetail, getStreetGeometries, listStreetNames } = await import("@ameciclo/db");
      return await withDb(async (db) => {
        const found = (await listStreetNames(db)).find((s) => slugify(s.name) === data.slug);
        if (!found) return { via: null, unavailable: false };
        const detail = await getStreetDetail(db, found.key);
        if (!detail) return { via: null, unavailable: false };
        const [geometry] = await getStreetGeometries(db, [found.key]);
        return { via: { ...detail, geometry: geometry?.geometry ?? null }, unavailable: false };
      });
    } catch (error) {
      console.error("Error loading a street from the database:", error);
      return { via: null, unavailable: true };
    }
  });

export const viaQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras", "via", slug],
    queryFn: () => fetchVia({ data: { slug } }),
    staleTime: 10 * 60 * 1000,
  });

export const viaSlug = (name: string) => slugify(name);
