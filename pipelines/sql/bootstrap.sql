-- Prepara um banco para o pipeline. Roda uma vez por banco (local, staging, produção), como superusuário/admin.
-- Pode rodar de novo sem estragar nada.
--
-- As pastas (schemas) do banco e quem é dono de cada uma:
--   raw         o pipeline: cópia fiel de cada fonte, tudo como texto
--   meta        o pipeline: o registro de cada carga (de qual arquivo, quando, quantas linhas)
--   staging     o pipeline (dbt): o mesmo dado limpo, com tipos, e o motivo de cada descarte
--   publicacao  o pipeline (dbt): views no formato exato de cada tabela final
--   public      o Drizzle (packages/db): as tabelas finais que o site lê, criadas e alteradas só pelas migrações.
--               O usuário do pipeline não pode criar, alterar nem apagar nada aqui; só ler, inserir e apagar linhas
--               nas tabelas que publica (ver permissoes.sql, que roda depois das migrações do Drizzle).
--
-- A senha do usuário pipeline não fica aqui: em cada ambiente, `alter role pipeline password '...'`.

create extension if not exists postgis;

do $$
begin
  if not exists (select from pg_roles where rolname = 'pipeline') then
    create role pipeline login;
  end if;
end $$;

-- Em alguns Postgres gerenciados (Azure), o admin precisa ser membro do role para dar a ele a posse de schemas.
grant pipeline to current_user;

create schema if not exists raw authorization pipeline;
create schema if not exists meta authorization pipeline;
create schema if not exists staging authorization pipeline;
create schema if not exists publicacao authorization pipeline;
alter schema raw owner to pipeline;
alter schema meta owner to pipeline;
alter schema staging owner to pipeline;
alter schema publicacao owner to pipeline;

-- O que for criado daqui em diante nestes schemas é do pipeline.
set role pipeline;

create table if not exists meta.carga (
  id           bigint generated always as identity primary key,
  fonte        text not null,              -- ex. datasus.sim
  particao     text not null,              -- ex. 2023 (o ano do arquivo)
  arquivo      text not null,              -- caminho no lago (R2 ou pasta local)
  sha256       text not null,
  linhas       integer,
  iniciada_em  timestamptz not null default now(),
  carregada_em timestamptz,
  publicada_em timestamptz,                -- quando a carga foi para a tabela final
  status       text not null default 'carregando' check (status in ('carregando', 'carregada', 'publicada', 'falhou'))
);
create index if not exists carga_fonte_idx on meta.carga (fonte, particao, iniciada_em desc);

reset role;
