-- As pastas (schemas) do banco e quem é dono de cada uma.
--   raw      a ingestão: cópia fiel de cada fonte, tudo como texto
--   staging  o dbt: o mesmo dado limpo, com tipos, e o motivo de cada descarte
--   marts    o dbt: as tabelas que o site lê
--   meta     a ingestão: o registro de cada carga (de qual arquivo, quando, quantas linhas)
--   public   o Drizzle (por enquanto; no desenho final vira "app")
create extension if not exists postgis;
-- Banco à parte para o histórico do Dagster (só no protótipo de comparação).
create database dagster;

create schema if not exists raw;
create schema if not exists meta;
-- staging e marts são criados pelo próprio dbt.

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
