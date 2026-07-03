# Autolens

A car marketplace built with Next.js 14 and Supabase. Private sellers and dealers post listings; buyers browse, filter, and message sellers in realtime.

## Stack

- Next.js 14 (App Router) with TypeScript
- Supabase: Postgres, Auth, Storage, Realtime
- Tailwind CSS v3
- Framer Motion
- Phosphor Icons
- Fonts: Satoshi (display), Geist (UI), Geist Mono (metadata)

## Features

- Email/password auth with private and dealer account types
- Three-step listing flow with drag-and-drop photo upload to Supabase Storage
- Server-side filtering and sorting: make, model, year, price, fuel, transmission, body type
- Free-text search across title, make, model, and location
- Realtime buyer-to-seller messaging with unread counts
- Public seller profiles with active listing grids
- Row Level Security on every table; protected routes via middleware
- View counter, skeleton loaders, empty states, and error states throughout

## Prerequisites

- Node.js 18.17 or later
- A free [Supabase](https://supabase.com) account

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Pick a strong database password and a region near you.
3. Wait for the project to finish provisioning (about a minute).

### 3. Run the schema

1. In the Supabase dashboard, open SQL Editor, then New query.
2. Paste the entire contents of `supabase/schema.sql` and run it.

This creates the tables (profiles, listings, listing_images, conversations, messages), all RLS policies, the signup trigger, the `listing-images` storage bucket, the realtime publication for messages, and the view-counter function.

### 4. Seed demo data (optional but recommended)

1. Open another New query in the SQL Editor.
2. Paste the contents of `supabase/seed.sql` and run it.

This creates 15 listings and two demo accounts you can sign in with:

| Account | Email | Password |
|---|---|---|
| Dealer (Summit Auto Group) | dealer@autolens.demo | autolens-demo |
| Private seller | seller@autolens.demo | autolens-demo |

Seed listing photos hotlink to unsplash.com placeholders. Photos uploaded through the app go to Supabase Storage as normal.

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in both values from the Supabase dashboard under Project Settings, then API:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## A note on email confirmation

New Supabase projects require email confirmation by default. For a smoother demo you can turn it off: Authentication, then Providers, then Email, then disable "Confirm email". The seeded demo accounts are pre-confirmed either way.

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/autolens.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import the `autolens` repository. Vercel detects Next.js automatically; keep the default build settings.

### 3. Add environment variables

In the import screen (or later under Project Settings, then Environment Variables), add both variables for all environments:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |

### 4. Deploy

Click Deploy. The first build takes a minute or two, then you get a live URL like `https://autolens.vercel.app`.

### 5. Point Supabase auth at the live URL

So that confirmation and redirect links work in production:

1. In Supabase, go to Authentication, then URL Configuration.
2. Set Site URL to your Vercel URL.
3. Add the same URL to Redirect URLs.

### 6. Put it on your portfolio

Link the live URL and the GitHub repo. If you want a custom domain, add it under the Vercel project's Settings, then Domains.

## Project structure

```
supabase/
  schema.sql          Tables, RLS, triggers, storage, realtime
  seed.sql            Demo accounts and 15 listings
src/
  middleware.ts       Session refresh + protected routes
  lib/
    types.ts          Row types and the Database generic
    utils.ts          Formatting helpers and constants
    supabase/         Browser and server clients
  components/         Navbar, cards, gallery, uploader, thread, filters
  app/
    page.tsx          Home
    listings/         Browse, detail, create
    auth/             Login, signup
    messages/         Inbox, conversation thread
    profile/[id]/     Public seller profile
```

## Implementation notes

- The config file is `next.config.mjs` rather than `next.config.ts` because Next.js 14 does not load TypeScript config files; that landed in Next 15.
- Anonymous visitors cannot update rows under RLS, so the view counter runs through a `security definer` SQL function (`increment_views`) instead of a direct update.
- Image domains allowed in `next.config.mjs`: `**.supabase.co` (uploads), `images.unsplash.com` (seed photos), and `picsum.photos` (spare placeholder source).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check with no emit |
