import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { Client } from "basic-ftp";

// Baixa do FTP do DATASUS os óbitos do SIM de um ano (todo o Brasil): a versão final
// (SIM/CID10/DORES) ou, se o ano ainda não saiu, a preliminar (SIM/PRELIM/DORES).
//
//   tsx scripts/datasus-baixar.ts 2026 /tmp/mortes     -> /tmp/mortes/DOBR2026.dbc

const [yearArg, dir] = process.argv.slice(2);
const year = Number(yearArg);
if (!Number.isInteger(year) || !dir) throw new Error("uso: datasus-baixar.ts ANO PASTA");
mkdirSync(dir, { recursive: true });

const target = join(dir, `DOBR${year}.dbc`);
const client = new Client(120_000);
try {
  await client.access({ host: "ftp.datasus.gov.br" });
  for (const [folder, status] of [["CID10/DORES", "final"], ["PRELIM/DORES", "preliminar"]] as const) {
    try {
      await client.downloadTo(target, `/dissemin/publicos/SIM/${folder}/DOBR${year}.dbc`);
      console.log(`${year}: versão ${status}, ${(statSync(target).size / 1e6).toFixed(1)} MB em ${target}`);
      process.exit(0);
    } catch {
      // Não existe nessa pasta: tenta a próxima.
    }
  }
  throw new Error(`${year}: arquivo não encontrado no DATASUS`);
} finally {
  client.close();
}
