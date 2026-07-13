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
  document       jsonb default '[]'::jsonb,
  stages         jsonb default '[false,false,false,false,false]'::jsonb,
  created_at     timestamptz default now()
);

-- Se a tabela já existia de uma versão anterior, garante as colunas novas:
alter table public.content_items add column if not exists link           text;
alter table public.content_items add column if not exists images         jsonb default '[]'::jsonb;
alter table public.content_items add column if not exists audio          text;
alter table public.content_items add column if not exists scheduled_date date;
alter table public.content_items add column if not exists document       jsonb default '[]'::jsonb;
alter table public.content_items add column if not exists stages         jsonb default '[false,false,false,false,false]'::jsonb;
alter table public.content_items add column if not exists metrics        jsonb default '{}'::jsonb;

-- ============================================================
-- Perfil da nutri (foto)
-- ============================================================
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  avatar     text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "perfil: ler"      on public.profiles;
drop policy if exists "perfil: criar"    on public.profiles;
drop policy if exists "perfil: atualizar" on public.profiles;

create policy "perfil: ler"      on public.profiles for select using (auth.uid() = user_id);
create policy "perfil: criar"    on public.profiles for insert with check (auth.uid() = user_id);
create policy "perfil: atualizar" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Galeria de fotos (organizada por tags)
-- ============================================================
create table if not exists public.gallery_photos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  src        text not null,
  tags       text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists gallery_photos_user_id_idx on public.gallery_photos (user_id);
alter table public.gallery_photos enable row level security;

drop policy if exists "galeria: ler"      on public.gallery_photos;
drop policy if exists "galeria: criar"    on public.gallery_photos;
drop policy if exists "galeria: atualizar" on public.gallery_photos;
drop policy if exists "galeria: apagar"   on public.gallery_photos;

create policy "galeria: ler"      on public.gallery_photos for select using (auth.uid() = user_id);
create policy "galeria: criar"    on public.gallery_photos for insert with check (auth.uid() = user_id);
create policy "galeria: atualizar" on public.gallery_photos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "galeria: apagar"   on public.gallery_photos for delete using (auth.uid() = user_id);

-- ============================================================
-- Banco de ideias (notas rápidas da nutri)
-- ============================================================
create table if not exists public.ideas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  text       text not null,
  favorite   boolean default false,
  created_at timestamptz default now()
);

create index if not exists ideas_user_id_idx on public.ideas (user_id);
alter table public.ideas enable row level security;

drop policy if exists "ideias: ler"      on public.ideas;
drop policy if exists "ideias: criar"    on public.ideas;
drop policy if exists "ideias: atualizar" on public.ideas;
drop policy if exists "ideias: apagar"   on public.ideas;

create policy "ideias: ler"      on public.ideas for select using (auth.uid() = user_id);
create policy "ideias: criar"    on public.ideas for insert with check (auth.uid() = user_id);
create policy "ideias: atualizar" on public.ideas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ideias: apagar"   on public.ideas for delete using (auth.uid() = user_id);

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
