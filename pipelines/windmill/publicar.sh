#!/bin/sh
# Cria a área de trabalho "ameciclo" no Windmill local (se não existir) e publica o fluxo do DATASUS.
# Usa o SUPERADMIN_SECRET do docker-compose (só local).
set -eu
cd "$(dirname "$0")"
api=http://localhost:8097/api
auth="Authorization: Bearer local-superadmin"
curl -fsS -X POST "$api/workspaces/create" -H "$auth" -H 'content-type: application/json' \
  -d '{"id":"ameciclo","name":"Ameciclo"}' >/dev/null 2>&1 || true
# Apaga a versão anterior (se houver) e cria de novo.
curl -fsS -X DELETE "$api/w/ameciclo/flows/delete/f/datasus/datasus" -H "$auth" >/dev/null 2>&1 || true
curl -fsS -X POST "$api/w/ameciclo/flows/create" -H "$auth" -H 'content-type: application/json' -d @datasus.flow.json
echo
