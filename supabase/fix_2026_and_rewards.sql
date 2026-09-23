-- Fix challenge window year (2025 -> 2026) and expand reward tiers to include 7, 20

alter table challenges alter column start_date set default '2026-09-23';
alter table challenges alter column end_date set default '2026-12-31';

update challenges
set start_date = '2026-09-23', end_date = '2026-12-31'
where start_date = '2025-09-23';

alter table rewards drop constraint if exists rewards_target_count_check;
alter table rewards add constraint rewards_target_count_check
  check (target_count in (7, 20, 50, 77, 100));
