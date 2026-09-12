-- Kena Scam — schema and row-level security.
--
-- This mirrors the live prototype project. The important part is not the table
-- shapes but the RLS policies: the public (anon) role can read ONLY approved
-- demo content, and has no read access at all to `reports` or
-- `moderation_items`. That is what makes it safe to ship a publishable key in
-- the browser bundle — the worst case is reading the curated demo stories the
-- site already displays.
--
-- Nothing here was collected from a social platform. Every seeded row is
-- fictional, redacted, and marked is_demo.

/* --------------------------------------------------------- controlled tags */

create table if not exists public.taxonomy_tags (
  id        text primary key,
  label     text not null,
  facet     text not null check (facet in ('scam_type','tactic','platform','geography','language')),
  tone      text not null,
  synonyms  jsonb not null default '[]'::jsonb
);

/* ---------------------------------------------------------------- trends */

create table if not exists public.trends (
  id             text primary key,
  slug           text unique,
  title          text not null,
  tagline        text,
  summary        text not null,
  why_it_spreads text not null,
  -- Semicolon separated; the app splits it for display.
  red_flags      text not null,
  safe_action    text not null,
  momentum       integer not null default 0,
  first_seen     date,
  platforms      jsonb not null default '[]'::jsonb,
  languages      jsonb not null default '[]'::jsonb,
  tags           jsonb not null default '[]'::jsonb,
  weekly_status  text not null,
  is_demo        boolean not null default true
);

/* --------------------------------------------------------------- stories */

create table if not exists public.stories (
  id                  text primary key,
  slug                text unique,
  title               text not null,
  summary             text,
  original_text       text not null,
  original_language   text not null check (original_language in ('bm','en','zh','ta')),
  translations        jsonb not null,
  title_translations  jsonb not null default '{}'::jsonb,
  platform            text not null,
  category            text not null,
  state               text not null,
  loss_range          text not null,
  sus_score           integer not null check (sus_score between 0 and 100),
  story_date          date not null,
  trend_id            text references public.trends (id),
  ai_suggested_tags   jsonb not null default '[]'::jsonb,
  user_confirmed_tags jsonb not null default '[]'::jsonb,
  tag_status          text not null check (tag_status in ('confirmed','pending_review')),
  red_flags           jsonb not null default '[]'::jsonb,
  safe_action         text,
  reactions           integer not null default 0,
  shares              integer not null default 0,
  saves               integer not null default 0,
  -- A story can only ever be curated demo content in this prototype.
  source_type         text not null check (source_type = 'curated_demo'),
  is_demo             boolean not null default true check (is_demo),
  status              text not null check (status in ('approved_demo','pending_review','removed'))
);

create table if not exists public.story_tags (
  story_id text not null references public.stories (id) on delete cascade,
  tag_id   text not null references public.taxonomy_tags (id) on delete cascade,
  primary key (story_id, tag_id)
);

/* ------------------------------------------------------------- provenance */

-- One record per story. The application never reads creator fields directly:
-- everything goes through publicAttributionFor() in lib/provenance.ts. RLS is
-- the outer layer of the same rule — a withdrawn record leaves the public API
-- entirely, before any application code runs.
create table if not exists public.story_sources (
  id                    text primary key,
  story_id              text not null unique references public.stories (id) on delete cascade,
  platform              text not null,
  source_url            text,
  source_type           text not null,
  creator_display_name  text,
  creator_handle        text,
  credit_preference     text not null check (credit_preference in ('anonymous','platform_only','handle_and_link')),
  consent_status        text not null check (consent_status in ('creator_submitted','creator_consented','official_source','public_lead_not_republished','demo')),
  consent_recorded_at   timestamptz,
  review_status         text not null check (review_status in ('pending_review','approved','withdrawn','removed')),
  original_published_at date,
  removal_requested_at  timestamptz,
  notes                 text
);

/* ------------------------------------------------------------------ radar */

create table if not exists public.radar_reports (
  id          text primary key,
  story_id    text references public.stories (id) on delete set null,
  state       text not null,
  category    text not null,
  platform    text not null,
  language    text not null,
  reported_at date not null,
  severity    text not null check (severity in ('low','medium','high')),
  is_demo     boolean not null default true check (is_demo),
  -- Named so it cannot be mistaken for live telemetry.
  status      text not null check (status = 'simulated_demo_not_live')
);

/* ----------------------------------------------------------------- weekly */

create table if not exists public.weekly_digests (
  id                      text primary key,
  week_start              date not null,
  headline                text not null,
  top_stories             jsonb not null default '[]'::jsonb,
  emerging_method         text not null,
  most_sus_link_behaviour text not null,
  ai_scam_watch           text not null,
  family_group_tip        text not null,
  is_demo                 boolean not null default true check (is_demo)
);

/* ------------------------------------------------------------- simulation */

create table if not exists public.simulation_scenarios (
  id                     text primary key,
  title                  text not null,
  difficulty             text not null check (difficulty in ('easy','medium','hard')),
  medium                 text not null default 'message',
  channel_label          text,
  prompt                 text not null,
  choices                jsonb not null,
  choice_details         jsonb not null default '[]'::jsonb,
  correct_choice         integer not null,
  red_flags              jsonb not null default '[]'::jsonb,
  real_world_action      text,
  coach_line             text not null,
  red_flag_annotations   jsonb not null default '[]'::jsonb,
  transcript_flags       jsonb not null default '[]'::jsonb,
  is_ai_voice_final_boss boolean not null default false,
  is_demo                boolean not null default true check (is_demo)
);

/* ------------------------------------------------ submissions & moderation */

-- Private by construction. The CHECK constraints make it impossible to store a
-- submission as public or as anything but pending review, so a bug in the
-- application cannot publish one.
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  category        text not null,
  platform        text,
  description     text not null,
  language        text,
  state           text,
  screenshot_path text,
  consent         boolean not null default false,
  tags            jsonb not null default '[]'::jsonb,
  status          text not null default 'pending_review' check (status = 'pending_review'),
  is_public       boolean not null default false check (not is_public),
  tag_status      text not null default 'pending_review' check (tag_status = 'pending_review'),
  created_at      timestamptz not null default now()
);

create table if not exists public.moderation_items (
  id         text primary key,
  type       text not null,
  status     text not null default 'pending_review',
  is_public  boolean not null default false check (not is_public),
  summary    text not null,
  created_at timestamptz not null default now()
);

/* ------------------------------------------------------ row-level security */

alter table public.taxonomy_tags        enable row level security;
alter table public.trends               enable row level security;
alter table public.stories              enable row level security;
alter table public.story_tags           enable row level security;
alter table public.story_sources        enable row level security;
alter table public.radar_reports        enable row level security;
alter table public.weekly_digests       enable row level security;
alter table public.simulation_scenarios enable row level security;
alter table public.reports              enable row level security;
alter table public.moderation_items     enable row level security;

create policy "Public reads taxonomy"
  on public.taxonomy_tags for select to anon, authenticated using (true);

create policy "Public reads demo trends"
  on public.trends for select to anon, authenticated using (is_demo);

create policy "Public reads approved demo stories"
  on public.stories for select to anon, authenticated
  using (is_demo and status = 'approved_demo');

create policy "Public reads tags of approved demo stories"
  on public.story_tags for select to anon, authenticated
  using (exists (
    select 1 from public.stories s
    where s.id = story_tags.story_id and s.is_demo and s.status = 'approved_demo'
  ));

-- Only approved provenance is readable. Withdrawing consent removes the row
-- from the public API, so attribution disappears everywhere at once.
create policy "Public reads approved source provenance"
  on public.story_sources for select to anon, authenticated
  using (review_status = 'approved');

create policy "Public reads simulated radar"
  on public.radar_reports for select to anon, authenticated
  using (is_demo and status = 'simulated_demo_not_live');

create policy "Public reads demo digest"
  on public.weekly_digests for select to anon, authenticated using (is_demo);

create policy "Public reads demo simulations"
  on public.simulation_scenarios for select to anon, authenticated using (is_demo);

-- DELIBERATELY NO POLICIES for public.reports or public.moderation_items.
-- With RLS enabled and no policy, the public role can neither read nor write
-- them. Submissions are handled server-side; nothing a visitor submits is
-- readable by anyone else, and nothing is ever auto-published.
