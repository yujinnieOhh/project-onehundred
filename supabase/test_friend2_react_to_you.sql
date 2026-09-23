-- Run this AFTER you accept test_friend2's request in the app.
-- test_friend2 reacts to your most recent completed checkin.

insert into reactions (checkin_id, sender_id, emoji)
select ci.id, '22222222-2222-2222-2222-222222222222', '🎉'
from checkins ci
join challenges c on c.id = ci.challenge_id
join profiles p on p.id = c.user_id
where p.username = 'yujinneiohh'
  and ci.completed = true
order by ci.date desc
limit 1;
