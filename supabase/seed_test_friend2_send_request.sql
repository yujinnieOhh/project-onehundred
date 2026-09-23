-- Second fake account, used to test the "incoming request" + "friend reacts
-- to me" direction. Run this whole file in one go.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'testfriend2@example.com',
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
values ('22222222-2222-2222-2222-222222222222', '테스트친구2', 'test_friend2', 'ko', 'Asia/Seoul');

insert into challenges (user_id, goal)
values ('22222222-2222-2222-2222-222222222222', '테스트 목표2 달성하기');

-- test_friend2 sends YOU a friend request
insert into friendships (requester_id, addressee_id)
select '22222222-2222-2222-2222-222222222222', p.id
from profiles p
where p.username = 'yujinneiohh';
