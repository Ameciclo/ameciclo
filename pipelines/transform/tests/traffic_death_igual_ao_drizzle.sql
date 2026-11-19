-- A view de publicação e a tabela do Drizzle têm as mesmas colunas, com os mesmos tipos (menos as que o banco
-- preenche: id e created_at). Se alguém mudar o schema do Drizzle sem mudar o dbt (ou o contrário), o build falha
-- aqui, antes de publicar, e cada linha devolvida diz qual coluna diverge.
with drizzle as (
  select column_name, data_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'traffic_death' and column_name not in ('id', 'created_at')
),
dbt as (
  select column_name, data_type
  from information_schema.columns
  where table_schema = '{{ ref("traffic_death").schema }}' and table_name = '{{ ref("traffic_death").identifier }}'
)
select
  coalesce(drizzle.column_name, dbt.column_name) as coluna,
  drizzle.data_type as no_drizzle,
  dbt.data_type as no_dbt
from drizzle
full join dbt using (column_name)
where drizzle.data_type is distinct from dbt.data_type
