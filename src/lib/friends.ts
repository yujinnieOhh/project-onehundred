import { createClient } from '@/lib/supabase/server'
import { getLocalDateString, addDays } from '@/lib/date'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type FriendActivity = {
  id: string
  nickname: string
  username: string
  goal: string
  completedToday: boolean
  completedYesterday: boolean
}

/** Accepted friends of `userId`, each with their own today/yesterday completion (their own timezone). */
export async function getAcceptedFriendsWithActivity(
  supabase: SupabaseServerClient,
  userId: string
): Promise<FriendActivity[]> {
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  const otherIds = (friendships ?? []).map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  )
  if (otherIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname, username, timezone')
    .in('id', otherIds)

  const results = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('id, goal')
        .eq('user_id', p.id)
        .maybeSingle()

      let completedToday = false
      let completedYesterday = false

      if (challenge) {
        const friendToday = getLocalDateString(p.timezone)
        const friendYesterday = addDays(friendToday, -1)
        const { data: recent } = await supabase
          .from('checkins')
          .select('date, completed')
          .eq('challenge_id', challenge.id)
          .in('date', [friendToday, friendYesterday])

        completedToday = (recent ?? []).some((c) => c.date === friendToday && c.completed)
        completedYesterday = (recent ?? []).some((c) => c.date === friendYesterday && c.completed)
      }

      return {
        id: p.id,
        nickname: p.nickname,
        username: p.username,
        goal: challenge?.goal ?? '',
        completedToday,
        completedYesterday,
      }
    })
  )

  return results
}
