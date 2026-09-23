-- Backfill missing milestone rows (7/20/50/77/100) for existing challenges
-- so every milestone always shows on the rewards list, with a blank title
-- where the user didn't set one at Setup time.

insert into rewards (challenge_id, target_count, title)
select c.id, t.target_count, ''
from challenges c
cross join (values (7), (20), (50), (77), (100)) as t(target_count)
where not exists (
  select 1 from rewards r
  where r.challenge_id = c.id and r.target_count = t.target_count
);
