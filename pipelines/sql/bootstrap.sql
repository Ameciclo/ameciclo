-- As pastas (schemas) do banco e quem é dono de cada uma.
--   raw      a ingestão: cópia fiel de cada fonte, tudo como texto
--   staging  o dbt: o mesmo dado limpo, com tipos, e o motivo de cada descarte
--   publicacao  o dbt: views no formato exato de cada tabela final (o que vai ser publicado)
--   meta     a ingestão: o registro de cada carga (de qual arquivo, quando, quantas linhas)
--   public   o Drizzle (packages/db): as tabelas finais que o site lê, criadas pelas migrações dele. O pipeline só
--            escreve nelas no passo de publicação (ingest/publicar.py).
create extension if not exists postgis;
-- Banco à parte para o estado do Kestra (só no ambiente local de comparação).
create database kestra;

create schema if not exists raw;
create schema if not exists meta;
-- staging e publicacao são criados pelo próprio dbt; public, pelas migrações do Drizzle.

create table if not exists meta.carga (
  id           bigint generated always as identity primary key,
  fonte        text not null,              -- ex. datasus.sim
  particao     text not null,              -- ex. 2023 (o ano do arquivo)
  arquivo      text not null,              -- caminho no lago (R2 ou pasta local)
  sha256       text not null,
  linhas       integer,
  iniciada_em  timestamptz not null default now(),
  carregada_em timestamptz,
  publicada_em timestamptz,                -- quando o dbt build passou com esta carga
  status       text not null default 'carregando' check (status in ('carregando', 'carregada', 'publicada', 'falhou'))
);
create index if not exists carga_fonte_idx on meta.carga (fonte, particao, iniciada_em desc);
