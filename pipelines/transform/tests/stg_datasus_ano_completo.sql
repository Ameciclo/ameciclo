-- Barra arquivo incompleto: um ano fechado da RMR nunca teve menos de 500 óbitos (2011-2025: de 535 a 859).
-- O ano corrente fica de fora, porque o DATASUS publica a versão preliminar aos poucos.
-- Como este teste é do staging, se falhar o mart não é refeito e o site continua com a versão anterior.
select ano_arquivo, count(*) as obitos
from {{ ref('stg_datasus__obitos') }}
where motivo_descarte is null and ano_arquivo < extract(year from current_date)
group by 1
having count(*) < 500
