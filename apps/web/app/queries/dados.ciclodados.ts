import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  CountLocation,
  CyclingMapGeojson,
  PerfilFilters,
  PerfilLocation,
  PerfilPointRow,
  PlacesFeatureCollection,
  PointInfo,
} from "@ameciclo/db";

// CicloDados: as camadas do mapa e o resumo de um ponto, do banco. Cada camada é independente: se uma falha, só ela some
// (`null`), e a página não espera por ela. Tudo são agregados e geometrias; nada individual sai do servidor.

async function layer<T>(name: string, read: (db: import("~/lib/db.server").Db) => Promise<T>): Promise<T | null> {
  try {
    const { withDb } = await import("~/lib/db.server");
    return await withDb(read);
  } catch (error) {
    console.error(`Error loading the CicloDados layer "${name}" from the database:`, error);
    return null;
  }
}

const hour = 60 * 60 * 1000;

// ---- O que a rota precisa para abrir: as contagens da Ameciclo e os pontos da pesquisa de perfil -----------------

export type CicloDadosBase = {
  contagemData: { ameciclo: CountLocation[]; prefeitura: never[] };
  perfilCiclistas: { filters: Record<string, never>; total_locations: number; locations: PerfilLocation[] } | null;
};

const fetchCicloDados = createServerFn({ method: "GET" }).handler(async (): Promise<CicloDadosBase> => {
  const { getCountLocations, getPerfilLocations } = await import("@ameciclo/db");
  const [counts, perfil] = await Promise.all([layer("contagens", (db) => getCountLocations(db)), layer("perfil", (db) => getPerfilLocations(db))]);
  return { contagemData: { ameciclo: counts ?? [], prefeitura: [] }, perfilCiclistas: perfil };
});

export const ciclodadosQueryOptions = () =>
  queryOptions({ queryKey: ["dados", "ciclodados"], queryFn: () => fetchCicloDados(), staleTime: hour });

// ---- Infraestrutura e execução do PDC ----------------------------------------------------------------------------

const fetchCyclingMap = createServerFn({ method: "GET" }).handler(async (): Promise<{ map: CyclingMapGeojson | null }> => {
  const { getCyclingMapGeojson } = await import("@ameciclo/db");
  return { map: await layer("infraestrutura", (db) => getCyclingMapGeojson(db)) };
});

export const cyclingMapQueryOptions = () =>
  queryOptions({ queryKey: ["dados", "ciclodados", "infra"], queryFn: () => fetchCyclingMap(), staleTime: hour });

// ---- Bicicletários e Bike PE -------------------------------------------------------------------------------------

const fetchRacks = createServerFn({ method: "GET" }).handler(async (): Promise<{ places: PlacesFeatureCollection | null }> => {
  const { getBicycleRacksGeojson } = await import("@ameciclo/db");
  return { places: await layer("bicicletarios", (db) => getBicycleRacksGeojson(db)) };
});

const fetchStations = createServerFn({ method: "GET" }).handler(async (): Promise<{ places: PlacesFeatureCollection | null }> => {
  const { getBikeStationsGeojson } = await import("@ameciclo/db");
  return { places: await layer("bike-pe", (db) => getBikeStationsGeojson(db)) };
});

export const racksQueryOptions = () => queryOptions({ queryKey: ["dados", "ciclodados", "bicicletarios"], queryFn: () => fetchRacks(), staleTime: hour });
export const stationsQueryOptions = () => queryOptions({ queryKey: ["dados", "ciclodados", "bikepe"], queryFn: () => fetchStations(), staleTime: hour });

// ---- Pesquisa de perfil: pontos com o total que passa nos filtros ---------------------------------------------------

const PerfilInput = z.object({ genero: z.string().max(60).optional(), raca: z.string().max(60).optional(), socio: z.string().max(120).optional(), dias: z.string().max(20).optional() });

const fetchPerfilPoints = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => PerfilInput.parse(input))
  .handler(async ({ data }): Promise<{ points: PerfilPointRow[] | null }> => {
    const { getPerfilPoints } = await import("@ameciclo/db");
    return { points: await layer("perfil-pontos", (db) => getPerfilPoints(db, data)) };
  });

export const perfilPointsQueryOptions = (filters: PerfilFilters) =>
  queryOptions({ queryKey: ["dados", "ciclodados", "perfil-pontos", filters], queryFn: () => fetchPerfilPoints({ data: filters }), staleTime: hour });

// ---- O resumo de um ponto clicado ----------------------------------------------------------------------------------

const PointInput = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), radius: z.number().min(50).max(1000).optional() });

const fetchPointInfo = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => PointInput.parse(input))
  .handler(async ({ data }): Promise<{ info: PointInfo | null }> => {
    const { getPointInfo } = await import("@ameciclo/db");
    return { info: await layer("ponto", (db) => getPointInfo(db, data)) };
  });

export const pointInfoQueryOptions = (lat: number, lng: number, radius = 200) =>
  queryOptions({ queryKey: ["dados", "ciclodados", "ponto", lat, lng, radius], queryFn: () => fetchPointInfo({ data: { lat, lng, radius } }), staleTime: hour });

export const loadPointInfo = (lat: number, lng: number, radius = 200) => fetchPointInfo({ data: { lat, lng, radius } });
