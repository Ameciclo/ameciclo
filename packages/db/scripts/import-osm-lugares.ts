import { sql } from "drizzle-orm";

import { type Db, withDb } from "../src";
import { fetchPlaces, RACKS_QUERY, STATIONS_QUERY } from "../src/places/osm";
import { toRack, toStation } from "../src/places/transform";
import { bicycleRack, bikeShareStation } from "../src/schema";

// Importa do OpenStreetMap os bicicletários e as estações de Bike PE da Região Metropolitana do Recife, para as camadas
// "Bicicletários" e "Estações de Bike PE" do CicloDados.
//
//   pnpm --filter @ameciclo/db db:import-osm-lugares             busca no Overpass e substitui as duas tabelas
//   pnpm --filter @ameciclo/db db:import-osm-lugares -- --dry-run só busca e relata
//
// As tabelas são um retrato do OSM: cada execução as substitui por inteiro numa transação (desfeita se a contagem final
// não bater). Se o Overpass devolver muito menos do que o esperado (uma consulta que falhou em silêncio), nada é gravado.

try {
  process.loadEnvFile();
} catch {}

const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
const connectionString = process.env.DATABASE_URL;
if (!connectionString && !dryRun) throw new Error("DATABASE_URL is not set (packages/db/.env)");
const contact = process.env.OVERPASS_CONTACT && !process.env.OVERPASS_CONTACT.startsWith("${") ? process.env.OVERPASS_CONTACT : undefined;
const log = (message: string) => console.log(`${new Date().toISOString()} ${message}`);

// Abaixo disso, a resposta não pode ser a região inteira (hoje há centenas de bicicletários e dezenas de estações).
const MIN_RACKS = 50;
const MIN_STATIONS = 10;
const BATCH = 500;

const racks = (await fetchPlaces(RACKS_QUERY, { contact, log })).places.map(toRack);
const stations = (await fetchPlaces(STATIONS_QUERY, { contact, log })).places.map(toStation);
const withCapacity = (rows: { capacity: number | null }[]) => rows.filter((r) => r.capacity !== null).length;
console.log(`${racks.length} bicicletários (${withCapacity(racks)} com número de vagas); ${stations.length} estações de Bike PE (${withCapacity(stations)} com capacidade)`);
if (racks.length < MIN_RACKS || stations.length < MIN_STATIONS) {
  throw new Error(`Poucos pontos (${racks.length} bicicletários, ${stations.length} estações): nada foi gravado.`);
}
if (dryRun) {
  console.log("Dry run: nada foi gravado.");
  process.exit(0);
}

const point = (lon: number, lat: number) => sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`;

async function load(db: Db) {
  await db.transaction(async (tx) => {
    await tx.delete(bicycleRack);
    await tx.delete(bikeShareStation);
    for (let i = 0; i < racks.length; i += BATCH) {
      await tx.insert(bicycleRack).values(
        racks.slice(i, i + BATCH).map((r) => ({ osmId: r.osmId, name: r.name, capacity: r.capacity, covered: r.covered, access: r.access, operator: r.operator, parkingType: r.parkingType, geom: point(r.lon, r.lat), tags: r.tags })),
      );
    }
    for (let i = 0; i < stations.length; i += BATCH) {
      await tx.insert(bikeShareStation).values(
        stations.slice(i, i + BATCH).map((s) => ({ osmId: s.osmId, name: s.name, ref: s.ref, capacity: s.capacity, network: s.network, operator: s.operator, geom: point(s.lon, s.lat), tags: s.tags })),
      );
    }
    const [{ r }] = await tx.select({ r: sql<number>`count(*)::int` }).from(bicycleRack);
    const [{ s }] = await tx.select({ s: sql<number>`count(*)::int` }).from(bikeShareStation);
    if (r !== racks.length || s !== stations.length) throw new Error(`gravei ${r} bicicletários e ${s} estações, esperava ${racks.length} e ${stations.length}`);
  });
}

await withDb(connectionString ?? "", load);
console.log("Importação concluída.");
