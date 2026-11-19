#!/usr/bin/env bash
# Confere, num banco vazio, se o pipeline e as tabelas do Drizzle continuam batendo. Roda no CI (pipelines.yml) e
# localmente. Falha se:
#   - uma migração do Drizzle mudou uma tabela publicada e o dbt não acompanhou (ou o contrário):
#     o teste traffic_death_igual_ao_drizzle diz qual coluna diverge;
#   - o SQL do dbt não compila ou quebra o contrato de alguma view de publicação;
#   - o pipeline perdeu permissão de que precisa (o dbt e a ingestão rodam com o usuário restrito).
#
# O raw é criado a partir de um CSV só com o cabeçalho do SIM (tests/fixtures): os testes de dados passam vazios, o
# que interessa aqui é a estrutura.
#
#   PGHOST=localhost PGPORT=5432 PGDATABASE=ci ADMIN_USER=ameciclo ADMIN_PASSWORD=ameciclo pipelines/ci/conferir-drizzle.sh
set -euo pipefail
: "${PGHOST:?}" "${PGPORT:?}" "${PGDATABASE:?}" "${ADMIN_USER:?}" "${ADMIN_PASSWORD:?}"
cd "$(dirname "$0")/.."

ADMIN_URL="postgresql://${ADMIN_USER}:${ADMIN_PASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
admin() { psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -q "$@"; }

echo "== banco: bootstrap, migrações do Drizzle, permissões"
admin -f sql/bootstrap.sql
admin -c "alter role pipeline password 'pipeline'"
(cd ../packages/db && DATABASE_URL="$ADMIN_URL" pnpm exec drizzle-kit migrate)
admin -f sql/permissoes.sql

# Daqui em diante, como o pipeline roda de verdade: com o usuário restrito.
export PGUSER=pipeline PGPASSWORD=pipeline
export PIPELINE_DATABASE_URL="postgresql://pipeline:pipeline@${PGHOST}:${PGPORT}/${PGDATABASE}"
export LAKE_DIR="$(mktemp -d)"
export DBT_SEND_ANONYMOUS_USAGE_STATS=false

echo "== raw: a estrutura do SIM, sem linhas"
uv run --frozen python -m ingest.datasus obter --ano 2000 --de-pasta tests/fixtures
uv run --frozen python -m ingest.datasus carregar --ano 2000

echo "== dbt build (contratos e conferência com o Drizzle)"
uv run --frozen dbt build --project-dir transform --profiles-dir transform --exclude-resource-type exposure

echo "== publicação (num banco vazio, não muda nada; confere que roda com as permissões do pipeline)"
uv run --frozen python -m ingest.publicar datasus.sim --tudo
