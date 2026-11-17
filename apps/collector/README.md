# Coletor do OpenStreetMap

Pergunta ao Overpass pela rede cicloviária da RMR, em pedaços pequenos, guarda cada resposta no R2 e manda o Workflow de `apps/sync` aplicar no banco.

Roda na **VPS do Coolify**, toda semana, porque a rede da Cloudflare não alcança o Overpass (os Workers recebem HTTP 521 do `overpass-api.de` e timeout dos outros espelhos; medido em 2026-11-17).

```
VPS (este app) ──► Overpass          busca em pedaços, cada um com retry próprio
      │
      ├──► R2 (ameciclo-cycling-osm)  <ambiente>/<data>/<id>/…  + manifest.json
      │
      └──► POST /start no Worker ──► Workflow `CicloSync`: valida o manifesto e grava numa transação
```

Só faz chamadas de saída. O Worker só aceita iniciar a aplicação de um snapshot que **já está** no R2.

## Variáveis de ambiente

| Variável | |
|---|---|
| `ENVIRONMENT` | `production` ou `staging` |
| `SYNC_URL` | URL do Worker (`https://ameciclo-sync.<conta>.workers.dev`, ou o de staging) |
| `SYNC_TOKEN` | o mesmo valor de `wrangler secret put SYNC_TOKEN [--env staging]` |
| `R2_ACCOUNT_ID` | id da conta Cloudflare |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | chave S3 do R2, restrita ao bucket (Object Read & Write) |
| `R2_BUCKET` | opcional, padrão `ameciclo-cycling-osm` |
| `KUMA_PUSH_URL` | opcional: monitor *Push* do uptime-kuma; avisa quando uma semana passa sem sucesso |
| `DRY_RUN` | `true` para o Workflow desfazer a transação |

## No Coolify

1. Aplicação a partir do repositório, `Dockerfile` em `apps/collector/Dockerfile` (contexto: a raiz). O contêiner só fica ligado.
2. Limite de memória no contêiner (a VM é compartilhada com o Strapi).
3. Uma *scheduled task* semanal, por exemplo `0 7 * * 1`, com o comando `pnpm --filter @ameciclo/collector collect`.

## Rodar à mão

```sh
pnpm --filter @ameciclo/collector collect   # com as variáveis acima
```
