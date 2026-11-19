#!/bin/sh
# Os quatro passos do DATASUS, na ordem. Localmente é este script; no servidor, cada linha vira um passo do Dagu.
#   ./run-datasus.sh 2023 ../data/mortes     um ano, a partir de um CSV já baixado
#   ./run-datasus.sh 2023                    um ano, baixando do FTP
set -eu
cd "$(dirname "$0")"
[ -f .env ] && set -a && . ./.env && set +a
: "${PIPELINE_DATABASE_URL:=postgresql://ameciclo:ameciclo@localhost:5440/ameciclo}"
export PIPELINE_DATABASE_URL
ano="$1"
pasta="${2:-}"

echo "== 1. obter"
if [ -n "$pasta" ]; then .venv/bin/python -m ingest.datasus obter --ano "$ano" --de-pasta "$pasta"
else .venv/bin/python -m ingest.datasus obter --ano "$ano"; fi

echo "== 2. carregar"
.venv/bin/python -m ingest.datasus carregar --ano "$ano"

echo "== 3. transformar (staging, testes, mart)"
.venv/bin/dbt build --project-dir transform --profiles-dir transform --select "source:datasus+"

echo "== 4. registrar"
.venv/bin/python -m ingest.publicar datasus.sim
