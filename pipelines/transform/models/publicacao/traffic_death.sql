-- Óbitos por acidente de transporte terrestre na RMR (ocorrência ou residência), no formato exato de
-- public.traffic_death, a tabela do Drizzle que /dados/sinistros-fatais lê. Ficam de fora só as colunas que o
-- próprio banco preenche (id e created_at). O passo de publicação copia daqui para lá.

-- Os tipos vão explícitos: o contrato do dbt aceita integer onde se pede smallint, a tabela do Drizzle não
-- (o teste traffic_death_igual_ao_drizzle pegou isso em age_years).
select
  ano_arquivo::smallint as source_year,
  linha_arquivo::integer as source_row,
  ano::smallint as year,
  mes::smallint as month,
  municipio_ocorrencia::integer as occurrence_city,
  municipio_residencia::integer as residence_city,
  local_obito::text as death_place,
  causa::text as cause,
  causas_secundarias::text as secondary_causes,
  sexo::text as sex,
  raca_cor::text as race_color,
  idade_anos::smallint as age_years
from {{ ref('stg_datasus__obitos') }}
where motivo_descarte is null
