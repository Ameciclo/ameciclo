/**
 * Snapshot do contrato de content types do Strapi, para detectar mudanças.
 *
 *   pnpm strapi:contract           # atualiza o snapshot
 *   pnpm strapi:contract --check   # falha se divergir (CI)
 *   STRAPI_SPEC_URL=http://localhost:1337/api/openapi.json pnpm strapi:contract
 *
 * Guarda só `components.schemas` da spec OpenAPI. Os 64 paths ficam de fora
 * porque mudam por motivos que não nos afetam (rotas internas de auth, upload)
 * e porque a spec do Strapi 5 é experimental e sai com defeitos justamente
 * neles — `/auth/sessions/{sessionId}` declara um parâmetro que não define.
 *
 * Deliberadamente NÃO geramos tipos nem schemas Zod a partir daqui. A spec
 * erra o formato da chave primária: declara `documentId` como uuid, e o
 * Strapi 5 emite cuid (`erndppywooar0fq6v99l2y5m`). Nenhum documento real
 * passaria numa validação derivada dela. O snapshot serve para revisão
 * humana — mostra no PR o que mudou no contrato, e alguém decide se algum
 * schema escrito à mão em app/queries/ precisa acompanhar.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SPEC_URL =
  process.env.STRAPI_SPEC_URL ?? "https://strapi.ameciclo.org/api/openapi.json";
const OUT = "strapi-contract.json";
const check = process.argv.includes("--check");

const res = await fetch(SPEC_URL);
if (!res.ok) {
  console.error(`Falha ao buscar a spec: ${res.status} ${SPEC_URL}`);
  process.exit(1);
}

const spec = await res.json();
const schemas = spec.components?.schemas;

if (!schemas || Object.keys(schemas).length === 0) {
  console.error("A spec não trouxe components.schemas — abortando.");
  process.exit(1);
}

// Ordena as chaves para o snapshot não oscilar com a ordem que a API devolve.
const sorted = Object.fromEntries(
  Object.keys(schemas)
    .sort()
    .map((k) => [k, schemas[k]])
);
const snapshot = JSON.stringify(sorted, null, 2) + "\n";
const count = Object.keys(sorted).length;

if (check) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== snapshot) {
    console.error(
      `\n${OUT} está desatualizado em relação a ${SPEC_URL}.\n` +
        `Rode \`pnpm strapi:contract\`, revise o diff e verifique se algum\n` +
        `schema Zod em app/queries/ precisa acompanhar a mudança.`
    );
    process.exit(1);
  }
  console.log(`${OUT} está em dia (${count} schemas).`);
} else {
  writeFileSync(OUT, snapshot);
  console.log(`${OUT} atualizado a partir de ${SPEC_URL} (${count} schemas).`);
}
