-- Uma linha por óbito do raw, com tipos e nomes nossos, e o motivo de ficar de fora do site (nulo = entra).
-- As regras são as do importador antigo (packages/db/src/deaths/transform.ts), agora em SQL.

with fonte as (
  select * from {{ source('datasus', 'datasus_sim') }}
),

tipado as (
  select
    _ano_arquivo as ano_arquivo,
    _linha as linha_arquivo,
    _carga as carga,
    -- DTOBITO vem como DDMMAAAA.
    case when {{ sim_limpo('"DTOBITO"') }} ~ '^\d{8}$' then substr({{ sim_limpo('"DTOBITO"') }}, 5, 4)::smallint end as ano,
    case when {{ sim_limpo('"DTOBITO"') }} ~ '^\d{8}$' then substr({{ sim_limpo('"DTOBITO"') }}, 3, 2)::smallint end as mes,
    {{ sim_sem_asterisco('"CAUSABAS"') }} as causa,
    {{ sim_municipio('"CODMUNOCOR"') }} as municipio_ocorrencia,
    {{ sim_municipio('"CODMUNRES"') }} as municipio_residencia,
    {{ sim_limpo('"LOCOCOR"') }} as local_obito,
    -- Linhas A a D e II da declaração (causas secundárias), separadas por espaço.
    nullif(concat_ws(' ',
      {{ sim_sem_asterisco('"LINHAA"') }}, {{ sim_sem_asterisco('"LINHAB"') }}, {{ sim_sem_asterisco('"LINHAC"') }},
      {{ sim_sem_asterisco('"LINHAD"') }}, {{ sim_sem_asterisco('"LINHAII"') }}
    ), '') as causas_secundarias,
    {{ sim_limpo('"SEXO"') }} as sexo,
    {{ sim_limpo('"RACACOR"') }} as raca_cor,
    -- IDADE: o primeiro dígito é a unidade (4 = anos, 5 = 100 anos ou mais; 0 a 3 = menos de 1 ano, que conta como 0).
    case
      when {{ sim_limpo('"IDADE"') }} !~ '^\d{3}$' then null
      when left({{ sim_limpo('"IDADE"') }}, 1) = '4' then substr({{ sim_limpo('"IDADE"') }}, 2)::smallint
      when left({{ sim_limpo('"IDADE"') }}, 1) = '5' then 100 + substr({{ sim_limpo('"IDADE"') }}, 2)::smallint
      when left({{ sim_limpo('"IDADE"') }}, 1) in ('0', '1', '2', '3') then 0
    end as idade_anos
  from fonte
)

select
  *,
  case
    when ano is null or mes not between 1 and 12 then 'sem data de óbito'
    -- V01 a V89: transporte terrestre; V99: transporte não especificado. V90-V98 (água, ar) e Y85 (sequelas) ficam de fora.
    when causa is null or causa !~ '^V([0-8][0-9]|99)' then 'causa básica fora de V01-V89 e V99'
    when coalesce(municipio_ocorrencia in ({{ var('rmr_sim') | join(', ') }}), false) = false
     and coalesce(municipio_residencia in ({{ var('rmr_sim') | join(', ') }}), false) = false then 'fora da RMR'
  end as motivo_descarte
from tipado
