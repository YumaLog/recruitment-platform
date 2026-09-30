-- WeJobs.ro — aplicațiile trimise pe Discord (api/discord-digest.js).
-- Rulează o dată în Supabase (SQL Editor, proiectul „wejobs") sau:
--   supabase db query --linked --file sql/0001_discord_notified.sql
alter table public.applications add column if not exists discord_notified_at timestamptz;
create index if not exists applications_discord_pending_idx
  on public.applications (created_at) where discord_notified_at is null and is_read = false;
comment on column public.applications.discord_notified_at is
  'Când a fost postată aplicația în canalul Discord de recrutare (cronul zilnic). NULL = încă nu.';
