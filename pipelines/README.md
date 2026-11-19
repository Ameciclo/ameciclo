# Pipelines de dados (protótipo)

Ingestão em Python e transformação em SQL (dbt), em camadas dentro do Postgres. Por enquanto só o DATASUS (óbitos
no trânsito), para comparar com o importador atual (`packages/db/scripts/import-mortes.ts`).

```
lago (pasta local; no servidor, R2)  arquivos brutos, guardados pelo hash
  └→ raw.datasus_sim                     cópia fiel, tudo texto, a última carga de cada ano
       └→ staging.stg_datasus__obitos       tipos, nomes e o motivo de cada descarte (view, dbt)
            └→ publicacao.traffic_death     o formato exato da tabela final (view, dbt, com contrato)
                 └→ public.traffic_death    a tabela que o site lê: do Drizzle (packages/db/src/deaths-schema.ts)
meta.carga                               de qual arquivo veio cada carga, quando, quantas linhas, se foi publicada
```

**Quem é dono do quê.** O Drizzle cria e muda a tabela final, pelas migrações de `packages/db`, e o site a lê com os
tipos dele. O dbt nunca cria tabela final: ele monta uma view com as mesmas colunas, e o passo de publicação copia
dela para a tabela do Drizzle. Se alguém mudar o schema de um lado e esquecer o outro, o teste
`traffic_death_igual_ao_drizzle` falha no `dbt build` e nada é publicado (o site continua como estava).

## Rodar localmente

```sh
cd pipelines
docker compose up -d --build        # Postgres (5440), Dagu (http://localhost:8095), Kestra (http://localhost:8098)
python3 kestra/sincronizar.py enviar   # manda o fluxo e o código para o Kestra
# A tabela final vem do Drizzle, como em produção, e depois o pipeline ganha permissão de escrever nela:
(cd ../packages/db && DATABASE_URL=postgresql://ameciclo:ameciclo@localhost:5440/ameciclo pnpm exec drizzle-kit migrate)
docker exec -i ameciclo-pipeline-db psql -U ameciclo -d ameciclo < sql/permissoes.sql
```

## Permissões

Os orquestradores e o dbt usam o usuário `pipeline`, criado por `sql/bootstrap.sql`. Ele é dono de `raw`, `meta`,
`staging` e `publicacao`. Em `public`, que é do Drizzle, só pode ler, inserir e apagar linhas das tabelas listadas em
`sql/permissoes.sql`. O banco recusa `alter`, `drop`, `create` e `truncate` vindos dele, e também a leitura das
outras tabelas do site. Por isso, a estrutura de `public` só muda pelas migrações do Drizzle.

Num banco novo (staging, produção), como admin:
1. `sql/bootstrap.sql`;
2. `alter role pipeline password '...'`;
3. as migrações do Drizzle;
4. `sql/permissoes.sql`.

## CI

O workflow `.github/workflows/pipelines.yml` roda em todo PR que mexe em `pipelines/` ou `packages/db/`. Ele executa
`ci/conferir-drizzle.sh`, que faz o seguinte num banco vazio:
1. aplica o bootstrap, as migrações do Drizzle e as permissões;
2. cria o `raw` com o cabeçalho do SIM;
3. roda `dbt build` e a publicação com o usuário restrito.

Se uma migração mudar uma tabela publicada sem o dbt acompanhar, ou o contrário, o PR fica vermelho e o teste
`traffic_death_igual_ao_drizzle` diz qual coluna diverge.

Para rodar localmente:

```sh
docker exec ameciclo-pipeline-db psql -U ameciclo -c "create database ci"
PGHOST=localhost PGPORT=5440 PGDATABASE=ci ADMIN_USER=ameciclo ADMIN_PASSWORD=ameciclo pipelines/ci/conferir-drizzle.sh
```

Nos dois orquestradores, o fluxo **datasus** com o ano e a pasta `/data/mortes` usa os CSVs de `data/mortes`; com a
pasta vazia ele baixa do FTP do DATASUS (e não baixa de novo por 24 h, a não ser forçando).

No Kestra, o fluxo **datasus-historico** roda o `datasus` para um intervalo de anos, um de cada vez (vazio = o ano
atual e os dois anteriores). Ele tem dois agendamentos: todo dia 5, os últimos três anos (os preliminares mudam e o
ano fechado sai cerca de 12 meses depois); e em 15 de março, a série inteira desde 2011, porque o DATASUS às vezes
republica anos antigos. Ano sem mudança é baixado de novo, mas não recarregado nem republicado.

## Os passos

1. **obter** (`ingest.datasus obter`): guarda o arquivo no lago. Se é igual ao último, nada muda.
2. **carregar** (`ingest.datasus carregar`): lago → `raw`, numa transação. Se esse arquivo já está no banco, pula.
3. **transformar** (`dbt build --select source:datasus+`): monta o staging e a view de publicação e roda os testes,
   inclusive a conferência com a tabela do Drizzle. Se algum falhar, o fluxo para aqui.
4. **publicar** (`ingest.publicar datasus.sim`): numa transação, apaga e insere de novo em `public.traffic_death`
   os anos com carga nova e marca essas cargas como publicadas. `--tudo` republica todos os anos (ex. depois de
   mudar uma regra no dbt).

## Os dois orquestradores

| | Dagu | Kestra |
|---|---|---|
| Endereço | http://localhost:8095 (sem login) | http://localhost:8098 (admin@kestra.io / Admin1234!) |
| Fluxo | `dags/datasus.yaml` | `kestra/flows/datasus.yaml` (namespace `ameciclo.pipelines`) |
| Código | `ingest/` e `transform/` montados no container | os mesmos arquivos, como *namespace files*: editáveis na aba Files |
| Na interface | o YAML; o Python e o SQL não aparecem | o YAML, o Python e os modelos dbt; cada modelo e teste do dbt vira uma linha na execução |
| Repetir o que falhou | Retry: refaz o passo que falhou e os seguintes | Replay a partir de um passo |
| Memória (medida, parado) | ~90 MB | ~2 GB (Java; dá para limitar com `JAVA_OPTS=-Xmx…`) |
| Onde roda o Python | dentro do container do Dagu | um container `python:3.12-slim` por passo (task runner Docker, o padrão do Kestra; exige o Kestra com acesso ao Docker do servidor) |

O código tem uma fonte só, este repositório. No Kestra, `python3 kestra/sincronizar.py enviar` manda o repositório
para lá e `puxar` traz de volta o que foi editado na interface (no servidor, o caminho seria o plugin de git do
Kestra). Os dois usam a mesma imagem de Python (`pyproject.toml`) e o mesmo lago.

## Kestra no Coolify (staging)

O app `kestra` do projeto Ameciclo, ambiente staging, responde em https://kestra.ameciclo.org. Ele é construído de
`pipelines/Dockerfile.kestra` (pasta base `/pipelines`) e usa a mesma configuração, `kestra/application.yaml`. Tudo
fica no `postgres-staging`:

- **Banco `kestra`**, dono o usuário `kestra`: o estado do Kestra (fluxos, execuções, fila).
- **Banco `ameciclo`, o de staging do site**: o pipeline escreve nele com o usuário `pipeline`. Esse banco já passou
  pelo `bootstrap.sql` e pelo `permissoes.sql`.

O Kestra roda como root e com o Docker do servidor montado (`/var/run/docker.sock`), como na documentação dele. Cada
passo roda num container `python:3.12-slim` próprio, ligado à rede `coolify`, onde fica o banco.

Variáveis do app:
- **O próprio Kestra:** `KESTRA_DB_*`, `KESTRA_ADMIN_*` e `JAVA_OPTS=-Xmx1g`.
- **Os passos:** `ENV_PG*` (no fluxo, `envs.pg*`) e `ENV_DOCKER_NETWORK`.
- **O lago:** `ENV_LAKE_VOLUME`, um volume do Docker que os passos montam em `/var/lib/pipelines/lake`.
- **A senha do usuário `pipeline`:** `SECRET_PGPASSWORD`, em base64, como o Kestra exige para segredos
  (no fluxo, `secret('PGPASSWORD')`).

Volume do app: `/app/storage`. Para mandar o código:

```sh
KESTRA_URL=https://kestra.ameciclo.org KESTRA_ADMIN_USER=admin@ameciclo.org KESTRA_ADMIN_PASSWORD=... \
  python3 pipelines/kestra/sincronizar.py enviar
```

## O que já foi verificado

- A tabela do Drizzle fica exatamente igual à view de publicação, e o resultado bate com o importador atual: 10.823
  óbitos de 2011 a 2026.
- Rodar de novo sem mudança pula os passos 1 e 2, e a publicação não mexe em nada.
- Um arquivo incompleto (2022 pela metade) faz o teste do staging falhar e nada é publicado.
- Uma coluna a mais na tabela do Drizzle (sem mudar o dbt) faz `traffic_death_igual_ao_drizzle` falhar no Kestra e
  nada é publicado; a carga fica esperando a próxima execução que passar.
- No Dagu, uma execução que falhou no `transformar` e foi repetida (retry) não refez `obter` nem `carregar`.

Diferença deliberada: `source_row` é a linha no arquivo original (no importador atual é a posição entre os óbitos
que entraram), para que cada óbito do site possa ser rastreado até o arquivo.
