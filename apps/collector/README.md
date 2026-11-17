# Coletor do OpenStreetMap

Atualiza a infraestrutura cicloviária do banco com o OpenStreetMap, toda semana: pergunta ao Overpass pela rede da RMR em pedaços pequenos (cada um com retry próprio), confere se está tudo e recente, e grava numa transação (`packages/db/src/cycling/sync.ts`). Cada execução aparece em `/infra/sincronizacoes` no admin, com um snapshot do resumo por município.

Roda na **VPS do Coolify**, e não em Worker, porque a rede da Cloudflare não alcança o Overpass (HTTP 521 do `overpass-api.de` e timeout dos outros espelhos, medido a partir de um Worker em 2026-11-17).

```
VPS (este app) ──► Overpass     relações do PDC, trechos por lote de ids, infraestrutura por tile
      │
      ├──► validação            todas as peças, e com dado do OSM de menos de 3 dias
      ├──► Postgres             uma transação (DATABASE_URL)
      └──► R2 (opcional)        cada resposta, em <ambiente>/<data>/<id>/…: o histórico do que o OSM disse
```

Só faz chamadas de saída. Se faltar peça, ou se o dado for velho (alguns espelhos do Overpass servem dado de meses atrás), nada é gravado.

## Variáveis de ambiente

| Variável | |
|---|---|
| `ENVIRONMENT` | `production` ou `staging` (prefixo dos snapshots e do `triggeredBy`) |
| `DATABASE_URL` | do banco a atualizar |
| `DRY_RUN` | `true` para desfazer a transação no fim |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | opcionais: chave S3 do R2 restrita ao bucket (Object Read & Write); sem elas não guarda snapshot |
| `R2_BUCKET` | opcional, padrão `ameciclo-cycling-osm` |
| `OVERPASS_CONTACT` | opcional: e-mail de contato do projeto, enviado ao Overpass no cabeçalho `From` (a etiqueta do Overpass pede) |
| `KUMA_PUSH_URL` | opcional: monitor *Push* do uptime-kuma, avisa quando uma semana passa sem sucesso |

## No Coolify

1. Aplicação a partir do repositório, `Dockerfile` em `apps/collector/Dockerfile` (contexto: a raiz). O contêiner só fica ligado.
2. Limite de memória no contêiner: a VM é compartilhada com o Strapi.
3. Uma *scheduled task* semanal (`0 7 * * 1`): `pnpm --filter @ameciclo/collector collect`, com `ENVIRONMENT=production` e a `DATABASE_URL` de produção.
4. Produção: o firewall do Postgres do Azure (`ameciclo-postgres-pub`) precisa liberar o IP público da VPS, uma vez.
5. Staging, quando quiser: a mesma imagem com `ENVIRONMENT=staging` e a URL do `postgres-staging`.

## Rodar à mão

```sh
ENVIRONMENT=staging DRY_RUN=true DATABASE_URL=postgres://… pnpm --filter @ameciclo/collector collect
```
