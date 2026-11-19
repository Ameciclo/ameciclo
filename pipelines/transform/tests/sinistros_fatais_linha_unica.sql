-- Cada linha do arquivo de origem aparece no máximo uma vez no mart.
select source_year, source_row, count(*)
from {{ ref('sinistros_fatais') }}
group by 1, 2
having count(*) > 1
