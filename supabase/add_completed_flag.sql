-- Reintroduce a completed flag on checkins.
-- Reasoning: notes must be writable before the day is marked done, so
-- "row exists" can no longer mean "completed" on its own.

alter table checkins add column completed boolean not null default false;

-- Backfill: every row created so far came from the old markDone insert,
-- so all existing rows are genuinely completed.
update checkins set completed = true;
