-- O que o pipeline pode fazer nas tabelas do Drizzle (schema public). Roda como admin, depois das migrações do
-- Drizzle (a tabela precisa existir). Pode rodar de novo sem estragar nada.
--
-- Só ler, inserir e apagar linhas das tabelas que o passo de publicação (ingest/publicar.py) alimenta. Criar,
-- alterar ou apagar tabelas continua sendo só das migrações do Drizzle: o banco recusa se o pipeline tentar.
-- Uma fonte nova que publica numa tabela nova entra aqui.

grant usage on schema public to pipeline;

grant select, insert, delete on public.traffic_death to pipeline;
