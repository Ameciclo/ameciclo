#!/bin/sh
# Roda o comando que vem depois com o DATABASE_URL do alvo escolhido (ALVO=staging|producao).
# Um só Dagu serve os dois ambientes; as duas URLs vêm do ambiente do container (Coolify).
case "$ALVO" in
  staging) url="$DATABASE_URL_STAGING" ;;
  producao) url="$DATABASE_URL_PRODUCAO" ;;
  *) echo "ALVO deve ser staging ou producao (veio: '$ALVO')" >&2; exit 1 ;;
esac
if [ -z "$url" ]; then
  echo "DATABASE_URL do alvo '$ALVO' não está configurada no Dagu" >&2
  exit 1
fi
export DATABASE_URL="$url"
exec "$@"
