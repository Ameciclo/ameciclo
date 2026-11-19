-- Óbitos por acidente de transporte terrestre na RMR (ocorrência ou residência): o que /dados/sinistros-fatais lê.
-- Mesmas colunas da traffic_death de hoje (menos id e created_at), para o site poder trocar de tabela sem mudar.

select
  ano_arquivo as source_year,
  linha_arquivo as source_row,
  ano as year,
  mes as month,
  municipio_ocorrencia as occurrence_city,
  municipio_residencia as residence_city,
  local_obito as death_place,
  causa as cause,
  causas_secundarias as secondary_causes,
  sexo as sex,
  raca_cor as race_color,
  idade_anos as age_years
from {{ ref('stg_datasus__obitos') }}
where motivo_descarte is null
