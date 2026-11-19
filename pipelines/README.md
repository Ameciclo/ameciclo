# Pipelines de dados (protótipo)

Ingestão em Python e transformação em SQL (dbt), em camadas dentro do Postgres. Por enquanto só o DATASUS (óbitos
no trânsito), para comparar com o importador atual (`packages/db/scripts/import-mortes.ts`).

```
lago (pasta local; no servidor, R2)  arquivos brutos, guardados pelo hash
  └→ raw.datasus_sim                 cópia fiel, tudo texto, a última carga de cada ano
       └→ staging.stg_datasus__obitos   tipos, nomes e o motivo de cada descarte (view)
            └→ marts.sinistros_fatais   o que o site lê (tabela, com contrato)
meta.carga                           de qual arquivo veio cada carga, quando, quantas linhas, se foi publicada
```

## Rodar localmente

```sh
cd pipelines
docker compose up -d --build   # Postgres (porta 5440) e Dagu (http://localhost:8095)
```

No Dagu, o fluxo **datasus** com `ANO=2023` e `PASTA=/data/mortes` usa os CSVs de `data/mortes`; com `PASTA` vazio
ele baixa do FTP do DATASUS (e não baixa de novo por 24 h, a não ser com `FORCAR=--forcar`). Pela linha de comando:

```sh
docker exec ameciclo-pipeline-dagu dagu start --params "ANO=2023 PASTA=/data/mortes" datasus
docker exec ameciclo-pipeline-dagu dagu retry --run-id=<id> datasus   # refaz só o passo que falhou e os seguintes
```

O código (`ingest/`, `transform/`, `dags/`) fica montado no container: editar não exige reconstruir a imagem. Só
mudanças no `pyproject.toml` pedem `--build`. Para rodar um passo à mão fora do Dagu: `uv sync` e
`PIPELINE_DATABASE_URL=postgresql://ameciclo:ameciclo@localhost:5440/ameciclo uv run python -m ingest.datasus ...`.

## Os passos

1. **obter** (`ingest.datasus obter`): guarda o arquivo no lago. Se é igual ao último, nada muda.
2. **carregar** (`ingest.datasus carregar`): lago → `raw`, numa transação. Se esse arquivo já está no banco, pula.
3. **transformar** (`dbt build --select source:datasus+`): monta o staging e roda os testes; se algum falhar, o mart
   não é refeito e o site continua com a versão anterior.
4. **registrar** (`ingest.publicar`): marca as cargas como publicadas em `meta.carga`.

## O que já foi verificado

- O mart dá exatamente o mesmo resultado do importador atual: 10.823 óbitos de 2011 a 2026, iguais linha a linha.
- Rodar de novo sem mudança pula os passos 1 e 2.
- Um arquivo incompleto (2022 pela metade) faz o teste do staging falhar e o mart não é refeito.
- Recarregar um ano a partir do lago (`carregar --forcar`) não precisa baixar nada.
- No Dagu, uma execução que falhou no `transformar` e foi repetida (retry) não refez `obter` nem `carregar`.

Diferença deliberada: `source_row` é a linha no arquivo original (no importador atual é a posição entre os óbitos
que entraram), para que cada óbito do site possa ser rastreado até o arquivo.

## Comparação de orquestradores (local)

O mesmo pipeline roda em três orquestradores, todos no `docker compose up -d --build`:

| | Endereço | Onde está o fluxo |
|---|---|---|
| Dagu | http://localhost:8095 | `dags/datasus.yaml` |
| Dagster | http://localhost:8096 | `orquestracao/definitions.py` (assets por ano + o projeto dbt via dagster-dbt) |
| Windmill | http://localhost:8097 (admin@windmill.dev / changeme) | `windmill/f/` (scripts Python nativos e o fluxo), sincronizados com `python3 windmill/sincronizar.py enviar` / `puxar` |

Dagu e Dagster chamam o código de `ingest/`. No Windmill cada passo é um script do próprio Windmill
(`windmill/f/datasus/*.py`, com as funções comuns em `windmill/f/pipelines/`), que se lê e edita na interface; o
banco chega por um resource (`f/pipelines/banco_local`). Os modelos SQL do dbt ficam em `transform/` para os três.
O `sincronizar.py` é provisório: o caminho certo é a CLI oficial (`wmill sync push` / `wmill sync pull`).
