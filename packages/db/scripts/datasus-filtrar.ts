import { createWriteStream, readFileSync } from "node:fs";
import { join } from "node:path";

import { readDbc } from "../src/datasus/dbc";

// Descompacta o .dbc baixado e guarda só os óbitos de trânsito (causa básica V, ou Y85 de sequelas)
// em mortes_transito_AAAA.csv, com todas as colunas do SIM. Quem decide o que entra no banco é o
// importador (import-mortes.ts).
//
//   tsx scripts/datasus-filtrar.ts 2026 /tmp/mortes

const [yearArg, dir] = process.argv.slice(2);
const year = Number(yearArg);
if (!Number.isInteger(year) || !dir) throw new Error("uso: datasus-filtrar.ts ANO PASTA");

const quote = (v: string) => `"${v.replaceAll('"', '""')}"`;
const out = createWriteStream(join(dir, `mortes_transito_${year}.csv`));
let columns: string[] | undefined;
let kept = 0;

const { records } = readDbc(readFileSync(join(dir, `DOBR${year}.dbc`)), (record) => {
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
console.log(`${year}: ${records} óbitos no Brasil, ${kept} de trânsito e sequelas (V e Y85)`);
