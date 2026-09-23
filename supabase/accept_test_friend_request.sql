update friendships
set status = 'accepted'
where addressee_id = '11111111-1111-1111-1111-111111111111'
  and status = 'pending';
