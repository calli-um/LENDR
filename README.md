# LENDR

A peer-to-peer rental marketplace built with Next.js and Supabase.

## Features

- Email/password authentication
- Browse rental listings with search and category filters
- Create and manage your own listings with photos
- Wishlist (saved items)
- Booking requests with lender confirm/decline flow
- In-app messaging per booking
- Public profiles with reviews and verification badges
- Offline payment (no in-app wallet or Stripe)

## Tech stack

- **Next.js 15** (App Router)
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **Tailwind CSS**
- **TypeScript**

## Setup

### 1. Clone and install

```bash
cd Projects/lendr
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run the migration file:
   `supabase/migrations/001_initial_schema.sql`
3. Enable Email auth under Authentication → Providers.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Find these in Supabase → Project Settings → API.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Manual test flow

1. Create two accounts (lender + renter).
2. Lender: list an item with photos at `/listings/new`.
3. Renter: browse home, save item to wishlist, request booking with dates.
4. Lender: accept booking at `/bookings`.
5. Both: exchange messages on the booking detail page.
6. Lender or renter: mark booking completed.
7. Renter: leave a review on the lender's profile.

## Project structure

```
app/           # Next.js pages and routes
components/    # UI and feature components
lib/           # Supabase clients, actions, validations
supabase/      # SQL migrations
types/         # TypeScript database types
```

## Notes

- **Verified lender** badge is set manually in Supabase (`profiles.verified_lender = true`).
- **Email verified** badge syncs automatically when the user confirms their email.
- Payments are arranged offline between users after a booking is confirmed.
