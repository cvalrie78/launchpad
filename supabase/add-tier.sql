-- ============================================================
-- LaunchPad — Add tier column to listings
-- Run this in Supabase SQL editor after schema.sql
-- ============================================================

alter table listings
  add column if not exists tier text not null default 'standard'
    check (tier in ('standard', 'featured', 'premium'));

-- Index for home page premium section query
create index if not exists listings_tier_idx on listings(tier);

-- Update any existing listings that have is_featured = true
update listings set tier = 'featured' where is_featured = true;
