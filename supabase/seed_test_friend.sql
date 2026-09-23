-- Seed a fake friend account for testing the friends/reactions flow.
-- This account never logs in for real — it's just data to react against.
-- Run this whole file in one go.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'testfriend@example.com',
  'not-a-real-password',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '',
  ''
);

insert into profiles (id, nickname, username, locale, timezone)
values ('11111111-1111-1111-1111-111111111111', '테스트친구', 'test_friend', 'ko', 'Asia/Seoul');

with new_challenge as (
  insert into challenges (user_id, goal)
  values ('11111111-1111-1111-1111-111111111111', '테스트 목표 달성하기')
  returning id
)
insert into checkins (challenge_id, date, completed)
select id, '2026-09-23', true from new_challenge;
