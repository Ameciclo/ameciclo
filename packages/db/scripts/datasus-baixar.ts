import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Client } from "basic-ftp";

// Baixa do FTP do DATASUS os óbitos do SIM de um ano (todo o Brasil): a versão final
// (SIM/CID10/DORES) ou, se o ano ainda não saiu, a preliminar (SIM/PRELIM/DORES).
//
//   tsx scripts/datasus-baixar.ts 2026 /tmp/trabalho /var/lib/dagu/raw [--forcar]
//
// Antes de baixar 130 MB, compara tamanho e data de modificação do arquivo no FTP com os da última
// importação que deu certo (rawdir/importado_AAAA.json, gravado pelo importador). Se nada mudou, não baixa e escreve "nao" em
// trabalho/mudou_AAAA.txt, que os passos seguintes usam para pular. Com --forcar, baixa de qualquer jeito.

const [yearArg, workDir, rawDir] = process.argv.slice(2);
const year = Number(yearArg);
if (!Number.isInteger(year) || !workDir || !rawDir) throw new Error("uso: datasus-baixar.ts ANO PASTA_DE_TRABALHO PASTA_BRUTA [--forcar]");
const force = process.argv.includes("--forcar");
mkdirSync(workDir, { recursive: true });
mkdirSync(rawDir, { recursive: true });

const changedFile = join(workDir, `mudou_${year}.txt`);
const sourceFile = join(workDir, `fonte_${year}.json`);
const importedFile = join(rawDir, `importado_${year}.json`);
const target = join(workDir, `DOBR${year}.dbc`);

const client = new Client(120_000);
try {
  await client.access({ host: "ftp.datasus.gov.br" });

  let found: { path: string; version: string; size: number; modified: Date } | undefined;
  for (const [folder, version] of [["CID10/DORES", "final"], ["PRELIM/DORES", "preliminar"]] as const) {
    const path = `/dissemin/publicos/SIM/${folder}/DOBR${year}.dbc`;
    try {
      found = { path, version, size: await client.size(path), modified: await client.lastMod(path) };
      break;
    } catch {
      // Não existe nessa pasta: tenta a próxima.
    }
  }
  if (!found) throw new Error(`${year}: arquivo não encontrado no DATASUS`);
  console.log(`${year}: versão ${found.version}, ${(found.size / 1e6).toFixed(1)} MB, modificado em ${found.modified.toISOString()}`);

  const previous = existsSync(importedFile) ? JSON.parse(readFileSync(importedFile, "utf8")) : undefined;
  const same =
    previous &&
    previous.versao === found.version &&
    previous.tamanho_ftp === found.size &&
    previous.modificado_ftp === found.modified.toISOString() &&
    existsSync(join(rawDir, `mortes_transito_${year}.csv`));
  if (same && !force) {
    writeFileSync(changedFile, "nao");
    console.log(`${year}: igual ao que já foi importado (importado a partir do arquivo baixado em ${previous.baixado_em}); nada a fazer. Use --forcar para baixar de novo.`);
    process.exit(0);
  }

  await client.downloadTo(target, found.path);
  console.log(`${year}: baixado em ${target} (${(statSync(target).size / 1e6).toFixed(1)} MB)`);
  writeFileSync(sourceFile, JSON.stringify({ versao: found.version, tamanho_ftp: found.size, modificado_ftp: found.modified.toISOString() }));
  writeFileSync(changedFile, "sim");
} finally {
  client.close();
}
