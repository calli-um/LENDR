-- LENDR initial schema

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  email_verified boolean not null default false,
  verified_lender boolean not null default false,
  created_at timestamptz not null default now()
);

-- Items
create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price_per_day numeric(10, 2) not null check (price_per_day >= 0),
  category text not null,
  location text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create index items_owner_id_idx on public.items(owner_id);
create index items_status_idx on public.items(status);
create index items_category_idx on public.items(category);

-- Item images
create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create index item_images_item_id_idx on public.item_images(item_id);

-- Wishlist
create table public.wishlist_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create index bookings_item_id_idx on public.bookings(item_id);
create index bookings_renter_id_idx on public.bookings(renter_id);
create index bookings_status_idx on public.bookings(status);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index messages_booking_id_idx on public.messages(booking_id);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

create index reviews_reviewee_id_idx on public.reviews(reviewee_id);

-- Booking overlap check function
create or replace function public.check_booking_overlap(
  p_item_id uuid,
  p_start_date date,
  p_end_date date,
  p_exclude_booking_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.bookings b
    where b.item_id = p_item_id
      and b.status = 'confirmed'
      and (p_exclude_booking_id is null or b.id != p_exclude_booking_id)
      and b.start_date < p_end_date
      and b.end_date > p_start_date
  );
end;
$$;

-- Profile trigger on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.email_confirmed_at is not null, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sync email verified on auth update
create or replace function public.handle_user_email_verified()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set email_verified = (new.email_confirmed_at is not null)
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_updated
  after update of email_confirmed_at on auth.users
  for each row execute procedure public.handle_user_email_verified();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Items policies
create policy "Active items are viewable by everyone"
  on public.items for select using (status = 'active' or owner_id = auth.uid());

create policy "Users can insert own items"
  on public.items for insert with check (auth.uid() = owner_id);

create policy "Users can update own items"
  on public.items for update using (auth.uid() = owner_id);

create policy "Users can delete own items"
  on public.items for delete using (auth.uid() = owner_id);

-- Item images policies
create policy "Item images viewable with item"
  on public.item_images for select using (
    exists (
      select 1 from public.items i
      where i.id = item_id and (i.status = 'active' or i.owner_id = auth.uid())
    )
  );

create policy "Owners can insert item images"
  on public.item_images for insert with check (
    exists (
      select 1 from public.items i
      where i.id = item_id and i.owner_id = auth.uid()
    )
  );

create policy "Owners can delete item images"
  on public.item_images for delete using (
    exists (
      select 1 from public.items i
      where i.id = item_id and i.owner_id = auth.uid()
    )
  );

-- Wishlist policies
create policy "Users can view own wishlist"
  on public.wishlist_items for select using (auth.uid() = user_id);

create policy "Users can add to own wishlist"
  on public.wishlist_items for insert with check (auth.uid() = user_id);

create policy "Users can remove from own wishlist"
  on public.wishlist_items for delete using (auth.uid() = user_id);

-- Bookings policies
create policy "Renters and lenders can view their bookings"
  on public.bookings for select using (
    auth.uid() = renter_id
    or exists (
      select 1 from public.items i
      where i.id = item_id and i.owner_id = auth.uid()
    )
  );

create policy "Authenticated users can create bookings"
  on public.bookings for insert with check (auth.uid() = renter_id);

create policy "Renters and lenders can update bookings"
  on public.bookings for update using (
    auth.uid() = renter_id
    or exists (
      select 1 from public.items i
      where i.id = item_id and i.owner_id = auth.uid()
    )
  );

-- Messages policies
create policy "Booking participants can view messages"
  on public.messages for select using (
    exists (
      select 1 from public.bookings b
      join public.items i on i.id = b.item_id
      where b.id = booking_id
        and (b.renter_id = auth.uid() or i.owner_id = auth.uid())
    )
  );

create policy "Booking participants can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.bookings b
      join public.items i on i.id = b.item_id
      where b.id = booking_id
        and (b.renter_id = auth.uid() or i.owner_id = auth.uid())
    )
  );

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Completed booking participants can leave reviews"
  on public.reviews for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and (b.renter_id = auth.uid() or exists (
          select 1 from public.items i
          where i.id = b.item_id and i.owner_id = auth.uid()
        ))
    )
  );

-- Storage bucket for item images
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

create policy "Anyone can view item images"
  on storage.objects for select
  using (bucket_id = 'item-images');

create policy "Authenticated users can upload item images"
  on storage.objects for insert
  with check (
    bucket_id = 'item-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can update own item images"
  on storage.objects for update
  using (
    bucket_id = 'item-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own item images"
  on storage.objects for delete
  using (
    bucket_id = 'item-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable Realtime for messages
alter publication supabase_realtime add table public.messages;
