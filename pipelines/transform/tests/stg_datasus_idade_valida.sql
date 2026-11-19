-- Idade de 0 a 199 anos entre os óbitos que entram no site; fora disso o código do SIM veio errado.
select linha_arquivo, ano_arquivo, idade_anos
from {{ ref('stg_datasus__obitos') }}
where motivo_descarte is null and idade_anos not between 0 and 199
