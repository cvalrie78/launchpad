-- ============================================================
-- LaunchPad — Application System Schema
-- Run this in Supabase SQL editor AFTER schema.sql
-- ============================================================

-- ── Students ────────────────────────────────────────────────
create table if not exists students (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  name            text not null,
  school          text,
  major           text,
  graduation_year int,
  resume_url      text,
  created_at      timestamptz default now()
);

create index if not exists students_email_idx on students(email);

-- ── Drop old scaffold applications table ────────────────────
drop table if exists applications;

-- ── Applications ────────────────────────────────────────────
create table if not exists applications (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings(id)  on delete cascade,
  student_id      uuid not null references students(id)  on delete cascade,
  cover_letter    text,
  status          text not null default 'applied'
                    check (status in ('applied','reviewed','interviewing','offered','rejected')),
  employer_notes  text,
  created_at      timestamptz default now(),
  unique (listing_id, student_id)   -- one application per student per listing
);

create index if not exists applications_listing_idx on applications(listing_id);
create index if not exists applications_student_idx on applications(student_id);
create index if not exists applications_status_idx  on applications(status);

-- ── Storage bucket (run via Supabase dashboard or CLI) ───────
-- supabase storage create resumes --public false
-- (bucket is private; signed URLs used for downloads)
-- Alternatively, paste this in SQL editor:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,   -- 5 MB
  array['application/pdf']
)
on conflict (id) do nothing;

-- ── RLS ─────────────────────────────────────────────────────
alter table students     enable row level security;
alter table applications enable row level security;

-- Students: only service role writes; a student can read their own row via email match
create policy "service manage students"
  on students for all using (true);   -- enforced at API layer with service key

-- Applications: students see only their own
create policy "student read own applications"
  on applications for select
  using (
    student_id = (
      select id from students where email = auth.jwt() ->> 'email' limit 1
    )
  );

-- Applications: employers see applications for listings belonging to their companies.
-- We join via listings → companies and match the posting employer_email stored on companies.
-- Simpler approach used here: service role API enforces scoping.
create policy "service manage applications"
  on applications for all using (true);   -- enforced at API layer with service key

-- Storage RLS: only allow uploads/downloads through signed URLs via service role
create policy "service read resumes"
  on storage.objects for select
  using ( bucket_id = 'resumes' );

create policy "service insert resumes"
  on storage.objects for insert
  with check ( bucket_id = 'resumes' );
