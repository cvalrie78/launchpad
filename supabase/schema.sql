-- ============================================================
-- LaunchPad Database Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Industries (seed table)
create table if not exists industries (
  id   serial primary key,
  name text not null unique,
  slug text not null unique,
  color text not null  -- hex color for badge
);

insert into industries (name, slug, color) values
  ('Technology',   'technology',   '#3b82f6'),
  ('Finance',      'finance',      '#10b981'),
  ('Engineering',  'engineering',  '#f59e0b'),
  ('Healthcare',   'healthcare',   '#ef4444'),
  ('Marketing',    'marketing',    '#8b5cf6'),
  ('Government',   'government',   '#6b7280'),
  ('Non-profit',   'non-profit',   '#ec4899'),
  ('Energy',       'energy',       '#f97316'),
  ('Consulting',   'consulting',   '#0ea5e9'),
  ('Legal',        'legal',        '#84cc16'),
  ('Media',        'media',        '#a855f7'),
  ('Real Estate',  'real-estate',  '#14b8a6')
on conflict do nothing;

-- Companies
create table if not exists companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  website     text,
  description text,
  industry    text,
  created_at  timestamptz default now()
);

-- Listings
create table if not exists listings (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade,
  title         text not null,
  type          text not null check (type in ('internship', 'co-op')),
  industry      text not null,
  location_type text not null check (location_type in ('remote', 'hybrid', 'on-site')),
  city          text,
  state         text,
  pay_rate      numeric(10,2),
  pay_period    text check (pay_period in ('hourly', 'monthly', 'stipend')),
  description   text not null,
  requirements  text,
  apply_url     text,
  apply_email   text,
  deadline      date,
  is_featured   boolean default false,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Index for fast filtering
create index if not exists listings_industry_idx      on listings(industry);
create index if not exists listings_type_idx          on listings(type);
create index if not exists listings_location_type_idx on listings(location_type);
create index if not exists listings_is_active_idx     on listings(is_active);
create index if not exists listings_is_featured_idx   on listings(is_featured);
create index if not exists listings_created_at_idx    on listings(created_at desc);

-- Applications (scaffolded for future use)
create table if not exists applications (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references listings(id) on delete cascade,
  student_email text not null,
  resume_url    text,
  cover_letter  text,
  status        text default 'pending' check (status in ('pending', 'reviewed', 'rejected', 'accepted')),
  created_at    timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table companies    enable row level security;
alter table listings     enable row level security;
alter table industries   enable row level security;
alter table applications enable row level security;

-- Public read access
create policy "public read companies"    on companies    for select using (true);
create policy "public read listings"     on listings     for select using (is_active = true);
create policy "public read industries"   on industries   for select using (true);

-- Service role can do anything (used by API routes with SUPABASE_SERVICE_ROLE_KEY)
-- Listings insert via API route (no auth required for posting — Stripe gates it)
create policy "service insert companies" on companies for insert with check (true);
create policy "service insert listings"  on listings  for insert with check (true);
create policy "service update listings"  on listings  for update using (true);

-- Admin can read all listings including inactive
create policy "admin read all listings" on listings for select using (true);

-- ============================================================
-- Sample seed data (optional — remove for production)
-- ============================================================

insert into companies (id, name, logo_url, website, description, industry) values
  ('11111111-0000-0000-0000-000000000001', 'Stripe', 'https://logo.clearbit.com/stripe.com', 'https://stripe.com', 'Financial infrastructure for the internet.', 'Technology'),
  ('11111111-0000-0000-0000-000000000002', 'Deloitte', 'https://logo.clearbit.com/deloitte.com', 'https://deloitte.com', 'Global professional services firm.', 'Consulting'),
  ('11111111-0000-0000-0000-000000000003', 'NASA', 'https://logo.clearbit.com/nasa.gov', 'https://nasa.gov', 'Pioneering the future in space exploration.', 'Government'),
  ('11111111-0000-0000-0000-000000000004', 'Pfizer', 'https://logo.clearbit.com/pfizer.com', 'https://pfizer.com', 'Global pharmaceutical leader.', 'Healthcare'),
  ('11111111-0000-0000-0000-000000000005', 'Goldman Sachs', 'https://logo.clearbit.com/goldmansachs.com', 'https://goldmansachs.com', 'Leading global investment banking firm.', 'Finance')
on conflict do nothing;

insert into listings (company_id, title, type, industry, location_type, city, state, pay_rate, pay_period, description, requirements, apply_url, deadline, is_featured, is_active) values
  ('11111111-0000-0000-0000-000000000001', 'Software Engineering Intern', 'internship', 'Technology', 'hybrid', 'San Francisco', 'CA', 45.00, 'hourly', 'Join Stripe''s engineering team and work on real payment infrastructure used by millions of businesses worldwide. You''ll be embedded in a product team, shipping code to production within your first week.', 'Currently enrolled in a BS/MS in CS or related field. Experience with at least one of: Go, Ruby, Java, Scala, or JavaScript. Strong problem-solving skills.', 'https://stripe.com/jobs', '2025-03-15', true, true),
  ('11111111-0000-0000-0000-000000000002', 'Business Technology Analyst Intern', 'internship', 'Consulting', 'on-site', 'New York', 'NY', 35.00, 'hourly', 'Work alongside senior consultants to deliver technology solutions for Fortune 500 clients. Projects span cloud migration, data analytics, and digital transformation.', 'Junior or Senior pursuing a degree in Business, CS, or Engineering. Strong analytical skills. GPA 3.2+.', 'https://deloitte.com/careers', '2025-02-28', true, true),
  ('11111111-0000-0000-0000-000000000003', 'Aerospace Engineering Co-op', 'co-op', 'Government', 'on-site', 'Houston', 'TX', 28.00, 'hourly', 'Work on spacecraft design and mission planning at NASA Johnson Space Center. This 6-month co-op gives you hands-on experience with real flight hardware.', 'US Citizenship required. Enrolled in ABET-accredited Aerospace, Mechanical, or Electrical Engineering program. Min 3.0 GPA.', 'https://nasa.gov/careers', '2025-01-31', false, true),
  ('11111111-0000-0000-0000-000000000004', 'Pharmaceutical Research Intern', 'internship', 'Healthcare', 'on-site', 'New York', 'NY', 7500.00, 'monthly', 'Support clinical trial data analysis and regulatory submission preparation within our Global Medical Affairs team.', 'Pre-med, Pharmacy, Biology, or Chemistry major. Familiarity with clinical data and FDA submission processes a plus.', 'https://pfizer.com/careers', '2025-03-01', false, true),
  ('11111111-0000-0000-0000-000000000005', 'Investment Banking Summer Analyst', 'internship', 'Finance', 'on-site', 'New York', 'NY', 110000.00, 'monthly', 'Join our M&A or Capital Markets group for a 10-week program. Build financial models, prepare client materials, and participate in live deal teams.', 'Junior pursuing Finance, Economics, or related degree. Exceptional quantitative and communication skills. Relevant coursework in accounting and corporate finance.', 'https://goldmansachs.com/careers', '2024-12-15', true, true)
on conflict do nothing;
