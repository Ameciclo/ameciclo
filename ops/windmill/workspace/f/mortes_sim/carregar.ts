import pg from "pg";

type Postgresql = { host: string; port: number; user: string; dbname: string; password: string; sslmode?: string };
type Obito = {
  year: number;
  month: number;
  occurrenceCity: number | null;
  residenceCity: number | null;
  deathPlace: string | null;
  cause: string;
  secondaryCauses: string | null;
  sex: string | null;
  raceColor: string | null;
  ageYears: number | null;
};

/**
 * Grava os óbitos em traffic_death, substituindo o ano inteiro numa transação.
 * Sem `gravar` (o padrão), só mostra o que seria gravado.
 */
export async function main(ano: number, obitos: Obito[], gravar = false, banco?: Postgresql) {
  const doAno = obitos.filter((o) => o.year === ano);
  const porMes = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [i + 1, doAno.filter((o) => o.month === i + 1).length] as const).filter(([, n]) => n > 0),
  );
  if (!gravar) return { gravado: false, motivo: "gravar=false (dry-run)", ano, obitos: doAno.length, por_mes: porMes };
  if (!banco) throw new Error("gravar=true precisa do recurso do banco (parâmetro banco)");

  const client = new pg.Client({
    host: banco.host,
    port: banco.port,
    user: banco.user,
    database: banco.dbname,
    password: banco.password,
    ssl: banco.sslmode && banco.sslmode !== "disable" ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("delete from traffic_death where source_year = $1", [ano]);
    for (const [i, o] of doAno.entries()) {
      await client.query(
        `insert into traffic_death (source_year, source_row, year, month, occurrence_city, residence_city, death_place, cause, secondary_causes, sex, race_color, age_years)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [ano, i + 1, o.year, o.month, o.occurrenceCity, o.residenceCity, o.deathPlace, o.cause, o.secondaryCauses, o.sex, o.raceColor, o.ageYears],
      );
    }
    const { rows } = await client.query("select count(*)::int as n from traffic_death where source_year = $1", [ano]);
    if (rows[0].n !== doAno.length) throw new Error(`gravei ${rows[0].n}, esperava ${doAno.length}`);
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    await client.end();
  }
  return { gravado: true, ano, obitos: doAno.length, por_mes: porMes };
}
