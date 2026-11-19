-- O que o pipeline pode fazer nas tabelas do Drizzle (schema public). Roda como admin, depois das migrações do
-- Drizzle (a tabela precisa existir). Pode rodar de novo sem estragar nada.
--
-- Só ler, inserir e apagar linhas das tabelas que o passo de publicação (ingest/publicar.py) alimenta. Criar,
-- alterar ou apagar tabelas continua sendo só das migrações do Drizzle: o banco recusa se o pipeline tentar.
-- Uma fonte nova que publica numa tabela nova entra aqui.

grant usage on schema public to pipeline;

grant select, insert, delete on public.traffic_death to pipeline;

-- OSM e Prefeitura (ingest/osm_lugares.py, ingest/ruas_pcr.py): retratos substituídos por inteiro.
grant select, insert, delete on public.bicycle_rack, public.bike_share_station, public.street_segment to pipeline;

-- Infraestrutura cicloviária (ingest/osm_ciclovias.py): sincroniza as vias e os vínculos com o PDC, sem criar
-- projetos. O catálogo do PDC e as cidades são do admin: aqui só se leem (e o projeto recebe as tags da relação).
grant select on public.cycling_city, public.cycling_city_summary to pipeline;
grant select, update (osm_relation_id, osm_tags, updated_at) on public.cycling_pdc_project to pipeline;
grant select, insert, update, delete on public.cycling_way to pipeline;
grant select, insert, delete on public.cycling_way_project to pipeline;
grant select, insert, update on public.cycling_sync_run to pipeline;
grant insert on public.cycling_summary_snapshot to pipeline;
