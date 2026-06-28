-- ============================================================
-- Mesa de Produção — estrutura do banco de dados
-- Cole TODO este conteúdo no Supabase: SQL Editor > New query > Run
-- ============================================================

-- Tabela onde ficam os conteúdos de cada usuária
create table if not exists public.content_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  platform    text not null,
  type        text,
  status      text not null default 'ideia',
  pilar       text,
  date        text,
  day_num     integer,
  time_slot   integer,
  steps       integer default 0,
  total       integer default 5,
  link           text,
  images         jsonb default '[]'::jsonb,
  audio          text,
  scheduled_date date,
  created_at     timestamptz default now()
);

-- Se a tabela já existia de uma versão anterior, garante as colunas novas:
alter table public.content_items add column if not exists link           text;
alter table public.content_items add column if not exists images         jsonb default '[]'::jsonb;
alter table public.content_items add column if not exists audio          text;
alter table public.content_items add column if not exists scheduled_date date;

-- Índice para carregar rápido os conteúdos de cada usuária
create index if not exists content_items_user_id_idx
  on public.content_items (user_id);

-- ============================================================
-- Segurança (RLS): cada usuária só enxerga e mexe nos PRÓPRIOS conteúdos
-- ============================================================
alter table public.content_items enable row level security;

drop policy if exists "ler os próprios conteúdos"      on public.content_items;
drop policy if exists "criar os próprios conteúdos"    on public.content_items;
drop policy if exists "atualizar os próprios conteúdos" on public.content_items;
drop policy if exists "apagar os próprios conteúdos"   on public.content_items;

create policy "ler os próprios conteúdos"
  on public.content_items for select
  using (auth.uid() = user_id);

create policy "criar os próprios conteúdos"
  on public.content_items for insert
  with check (auth.uid() = user_id);

create policy "atualizar os próprios conteúdos"
  on public.content_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "apagar os próprios conteúdos"
  on public.content_items for delete
  using (auth.uid() = user_id);
