#!/bin/sh
# Monta os scripts do Windmill que reaproveitam código do packages/db (o Windmill não importa do monorepo,
# então o fonte é copiado para dentro do script). Rode depois de mudar src/datasus ou src/deaths.
set -e
cd "$(dirname "$0")"
db=../../packages/db/src
out=workspace/f/mortes_sim
strip() { grep -v '^import ' "$1" | sed 's/^export //'; }

{
  echo '// GERADO por ops/windmill/build.sh (blast.ts + dbc.ts + o passo abaixo). Não edite aqui.'
  echo 'import { Client } from "basic-ftp";'
  echo 'import { readFileSync } from "node:fs";'
  strip $db/datasus/blast.ts
  strip $db/datasus/dbc.ts
  cat baixar_e_filtrar.main.ts
} > $out/baixar_e_filtrar.ts

{
  echo '// GERADO por ops/windmill/build.sh (transform.ts + o passo abaixo). Não edite aqui.'
  strip $db/deaths/transform.ts
  cat transformar.main.ts
} > $out/transformar.ts
