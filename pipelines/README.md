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
docker compose up -d                  # PostGIS na porta 5440
uv sync                               # Python 3.12, dbt, psycopg
./run-datasus.sh 2023 ../data/mortes  # obter -> carregar -> dbt build -> registrar
```

Sem a pasta, o `obter` baixa do FTP do DATASUS (e não baixa de novo por 24 h, a não ser com `--forcar`).

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

Diferença deliberada: `source_row` é a linha no arquivo original (no importador atual é a posição entre os óbitos
que entraram), para que cada óbito do site possa ser rastreado até o arquivo.
