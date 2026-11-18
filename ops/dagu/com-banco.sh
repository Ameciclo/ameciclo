#!/bin/sh
# Roda o comando que vem depois com o DATABASE_URL (e o ENVIRONMENT: staging ou production) do alvo escolhido (ALVO=staging|producao).
# Um só Dagu serve os dois ambientes; as duas URLs vêm do ambiente do container (Coolify).
case "$ALVO" in
  staging) url="$DATABASE_URL_STAGING"; ENVIRONMENT=staging ;;
  producao) url="$DATABASE_URL_PRODUCAO"; ENVIRONMENT=production ;;
  *) echo "ALVO deve ser staging ou producao (veio: '$ALVO')" >&2; exit 1 ;;
esac
if [ -z "$url" ]; then
  echo "DATABASE_URL do alvo '$ALVO' não está configurada no Dagu" >&2
  exit 1
fi
# Variável opcional que não existe no container chega ao fluxo como o texto literal "${NOME}" (e não vazia):
# o coletor a tomaria por valor (R2 com chave falsa, URL do Kuma inválida). Aqui ela volta a ficar indefinida.
for name in OVERPASS_CONTACT R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET KUMA_PUSH_URL; do
  eval "value=\${$name-}"
  case "$value" in
    '${'*) unset "$name" ;;
  esac
done
export DATABASE_URL="$url" ENVIRONMENT
exec "$@"
