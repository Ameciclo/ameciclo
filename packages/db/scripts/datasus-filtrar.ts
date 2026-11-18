import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { readDbc } from "../src/datasus/dbc";

// Descompacta o .dbc baixado e guarda só os óbitos de trânsito (causa básica V, ou Y85 de sequelas)
// em rawdir/mortes_transito_AAAA.csv, com todas as colunas do SIM, e um manifesto ao lado
// (manifest_AAAA.json) com a versão da fonte, o que entrou e a soma de verificação do arquivo.
// Esse CSV é o dado bruto: dá para reimportar sem baixar de novo do DATASUS. Quem decide o que entra
// no banco é o importador (import-mortes.ts).
//
//   tsx scripts/datasus-filtrar.ts 2026 /tmp/trabalho /var/lib/dagu/raw

const [yearArg, workDir, rawDir] = process.argv.slice(2);
const year = Number(yearArg);
if (!Number.isInteger(year) || !workDir || !rawDir) throw new Error("uso: datasus-filtrar.ts ANO PASTA_DE_TRABALHO PASTA_BRUTA");

const quote = (v: string) => `"${v.replaceAll('"', '""')}"`;
const final = join(rawDir, `mortes_transito_${year}.csv`);
const partial = `${final}.parcial`;
const out = createWriteStream(partial);
let columns: string[] | undefined;
let kept = 0;

const { records } = readDbc(readFileSync(join(workDir, `DOBR${year}.dbc`)), (record) => {
  const cause = (record.CAUSABAS ?? "").replace(/^\*/, "");
  if (!cause.startsWith("V") && !cause.startsWith("Y85")) return;
  if (!columns) {
    columns = Object.keys(record);
    out.write(`${columns.map(quote).join(",")}\n`);
  }
  out.write(`${columns.map((c) => quote(record[c] ?? "")).join(",")}\n`);
  kept += 1;
});
await new Promise((resolve) => out.end(resolve));

const sha256 = await new Promise<string>((resolve, reject) => {
  const hash = createHash("sha256");
  createReadStream(partial).on("data", (c) => hash.update(c)).on("end", () => resolve(hash.digest("hex"))).on("error", reject);
});
// Só vira o arquivo definitivo quando está completo.
renameSync(partial, final);

const source = JSON.parse(readFileSync(join(workDir, `fonte_${year}.json`), "utf8"));
writeFileSync(
  join(rawDir, `manifest_${year}.json`),
  JSON.stringify({ ano: year, ...source, baixado_em: new Date().toISOString(), obitos_no_brasil: records, transito_no_brasil: kept, arquivo: `mortes_transito_${year}.csv`, sha256 }, null, 2),
);
rmSync(join(workDir, `DOBR${year}.dbc`));
console.log(`${year}: ${records} óbitos no Brasil, ${kept} de trânsito e sequelas (V e Y85); bruto guardado em ${final}`);
