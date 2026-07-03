-- Autolens schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- PROFILES (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  avatar_url text,
  account_type text not null check (account_type in ('private', 'dealer')) default 'private',
  dealer_name text,
  location text,
  phone text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'account_type', 'private')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- LISTINGS
create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  make text not null,
  model text not null,
  year integer not null check (year >= 1900 and year <= 2100),
  price numeric not null check (price >= 0),
  mileage integer check (mileage >= 0),
  fuel_type text check (fuel_type in ('petrol', 'diesel', 'electric', 'hybrid', 'other')),
  transmission text check (transmission in ('manual', 'automatic')),
  body_type text check (body_type in ('sedan', 'suv', 'hatchback', 'coupe', 'truck', 'van', 'wagon', 'convertible', 'other')),
  colour text,
  condition text not null check (condition in ('new', 'used', 'certified_pre_owned')) default 'used',
  description text,
  location text,
  status text not null check (status in ('active', 'sold', 'draft')) default 'active',
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table listings enable row level security;
create policy "Active listings viewable by all" on listings for select using (status = 'active' or seller_id = auth.uid());
create policy "Authenticated users can insert listings" on listings for insert with check (auth.uid() = seller_id);
create policy "Sellers can update own listings" on listings for update using (auth.uid() = seller_id);
create policy "Sellers can delete own listings" on listings for delete using (auth.uid() = seller_id);

-- Indexes for common queries
create index listings_make_model_idx on listings(make, model);
create index listings_price_idx on listings(price);
create index listings_status_idx on listings(status);
create index listings_seller_idx on listings(seller_id);

-- View counter: anonymous visitors cannot update listings under RLS,
-- so increments go through a security-definer function instead.
create or replace function increment_views(listing uuid)
returns void as $$
  update listings set views = views + 1 where id = listing;
$$ language sql security definer;

-- LISTING IMAGES
create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  storage_path text not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table listing_images enable row level security;
create policy "Listing images viewable by all" on listing_images for select using (true);
create policy "Listing owners can manage images" on listing_images for all using (
  exists (select 1 from listings where listings.id = listing_id and listings.seller_id = auth.uid())
);

-- CONVERSATIONS
create table conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(listing_id, buyer_id, seller_id)
);
alter table conversations enable row level security;
create policy "Participants can view conversations" on conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Authenticated users can create conversations" on conversations for insert with check (auth.uid() = buyer_id);
create policy "Participants can update conversations" on conversations for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- MESSAGES
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table messages enable row level security;
create policy "Participants can view messages" on messages for select using (
  exists (select 1 from conversations where conversations.id = conversation_id and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid()))
);
create policy "Participants can send messages" on messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from conversations where conversations.id = conversation_id and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid()))
);
-- Needed so recipients can mark messages as read
create policy "Participants can update messages" on messages for update using (
  exists (select 1 from conversations where conversations.id = conversation_id and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid()))
);

-- Realtime: stream new messages into open conversation threads
alter publication supabase_realtime add table messages;

-- Storage bucket: listing-images (public)
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
create policy "Public read access" on storage.objects for select using (bucket_id = 'listing-images');
create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');
create policy "Owners can delete own images" on storage.objects for delete using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
