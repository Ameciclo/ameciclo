-- Cada linha do arquivo de origem aparece no máximo uma vez na publicação.
select source_year, source_row, count(*)
from {{ ref('traffic_death') }}
group by 1, 2
having count(*) > 1
