create schema if not exists private;

-- Embeddings
create extension vector with schema extensions;

-- Cron
create extension pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
