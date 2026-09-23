-- PROJECT ONE HUNDRED — initial schema
-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists citext;
create extension if not exists pgcrypto;

-- 1. profiles ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  username citext not null unique,
  locale text not null default 'ko',
  timezone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_authenticated"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. challenges --------------------------------------------------------
create table challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  goal text not null check (char_length(goal) <= 40),
  start_date date not null default '2025-09-23',
  end_date date not null default '2025-12-31',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table challenges enable row level security;

create policy "challenges_select_own_or_friend"
  on challenges for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = challenges.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = challenges.user_id))
    )
  );

create policy "challenges_insert_own"
  on challenges for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "challenges_update_own"
  on challenges for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 3. rewards -------------------------------------------------------------
create table rewards (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  target_count int not null check (target_count in (50, 77, 100)),
  title text,
  is_unlocked boolean not null default false,
  unlocked_at timestamptz,
  unique (challenge_id, target_count)
);

alter table rewards enable row level security;

create policy "rewards_select_own_or_friend"
  on rewards for select
  to authenticated
  using (
    exists (
      select 1 from challenges c
      where c.id = rewards.challenge_id
        and (
          c.user_id = auth.uid()
          or exists (
            select 1 from friendships f
            where f.status = 'accepted'
              and ((f.requester_id = auth.uid() and f.addressee_id = c.user_id)
                or (f.addressee_id = auth.uid() and f.requester_id = c.user_id))
          )
        )
    )
  );

create policy "rewards_insert_own"
  on rewards for insert
  to authenticated
  with check (
    exists (select 1 from challenges c where c.id = challenge_id and c.user_id = auth.uid())
  );

create policy "rewards_update_own"
  on rewards for update
  to authenticated
  using (
    exists (select 1 from challenges c where c.id = challenge_id and c.user_id = auth.uid())
  );

-- 4. checkins --------------------------------------------------------------
create table checkins (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, date)
);

alter table checkins enable row level security;

create policy "checkins_select_own_or_friend"
  on checkins for select
  to authenticated
  using (
    exists (
      select 1 from challenges c
      where c.id = checkins.challenge_id
        and (
          c.user_id = auth.uid()
          or exists (
            select 1 from friendships f
            where f.status = 'accepted'
              and ((f.requester_id = auth.uid() and f.addressee_id = c.user_id)
                or (f.addressee_id = auth.uid() and f.requester_id = c.user_id))
          )
        )
    )
  );

create policy "checkins_insert_own"
  on checkins for insert
  to authenticated
  with check (
    exists (select 1 from challenges c where c.id = challenge_id and c.user_id = auth.uid())
  );

create policy "checkins_update_own"
  on checkins for update
  to authenticated
  using (
    exists (select 1 from challenges c where c.id = challenge_id and c.user_id = auth.uid())
  );

create policy "checkins_delete_own"
  on checkins for delete
  to authenticated
  using (
    exists (select 1 from challenges c where c.id = challenge_id and c.user_id = auth.uid())
  );

-- 5. friendships -------------------------------------------------------------
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);

create unique index friendships_unique_pair
  on friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index friendships_requester_status_idx on friendships (requester_id, status);
create index friendships_addressee_status_idx on friendships (addressee_id, status);

alter table friendships enable row level security;

create policy "friendships_select_involved"
  on friendships for select
  to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships_insert_as_requester"
  on friendships for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "friendships_update_as_addressee"
  on friendships for update
  to authenticated
  using (addressee_id = auth.uid())
  with check (addressee_id = auth.uid());

-- 6. reactions -------------------------------------------------------------
create table reactions (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references checkins(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (checkin_id, sender_id)
);

alter table reactions enable row level security;

create policy "reactions_select_own_or_friend"
  on reactions for select
  to authenticated
  using (
    exists (
      select 1 from checkins ci
      join challenges c on c.id = ci.challenge_id
      where ci.id = reactions.checkin_id
        and (
          c.user_id = auth.uid()
          or exists (
            select 1 from friendships f
            where f.status = 'accepted'
              and ((f.requester_id = auth.uid() and f.addressee_id = c.user_id)
                or (f.addressee_id = auth.uid() and f.requester_id = c.user_id))
          )
        )
    )
  );

-- MVP: reactions are insert-only, no update/delete policy (final once sent)
create policy "reactions_insert_to_friend_checkin"
  on reactions for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from checkins ci
      join challenges c on c.id = ci.challenge_id
      join friendships f on f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = c.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = c.user_id))
      where ci.id = checkin_id
    )
  );
