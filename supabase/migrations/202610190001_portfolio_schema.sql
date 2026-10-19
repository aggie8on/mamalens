-- MamaLens portfolio content schema
-- Apply only after creating/selecting the intended Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  show_in_navigation boolean not null default true,
  nav_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null check (category in ('Sports','Models','Products','Studio','Outdoor','Indoor','Events')),
  description text not null default '',
  cover_image text,
  published_at timestamptz,
  sort_order integer not null default 100,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_url text not null,
  alt_text text not null default '',
  caption text not null default '',
  media_type text not null default 'image' check (media_type in ('image','video')),
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text not null default '',
  body jsonb not null default '{}'::jsonb,
  cover_image text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  attribution text not null default '',
  quote text not null,
  source_url text,
  is_approved boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.articles enable row level security;
alter table public.testimonials enable row level security;

-- Public visitors can read published content only.
create policy "Public read site settings" on public.site_settings for select using (key in ('site_title','social_links','spotify_playlist'));
create policy "Public read published pages" on public.pages for select using (is_published = true);
create policy "Public read published projects" on public.projects for select using (is_published = true);
create policy "Public read media for published projects" on public.project_media for select using (
  exists (select 1 from public.projects p where p.id = project_id and p.is_published = true)
);
create policy "Public read published articles" on public.articles for select using (is_published = true);
create policy "Public read approved testimonials" on public.testimonials for select using (is_approved = true);

-- Authenticated users do not automatically get write access. Add an owner-role
-- claim / allowlist policy after the owner's Supabase auth user is known.
-- Storage bucket 'portfolio-media' should be created as public-read, with uploads,
-- updates and deletes restricted to the verified owner role.
