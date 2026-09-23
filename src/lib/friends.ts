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
  activeCheckinId: string | null
  myReactionEmoji: string | null
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
      let activeCheckinId: string | null = null

      if (challenge) {
        const friendToday = getLocalDateString(p.timezone)
        const friendYesterday = addDays(friendToday, -1)
        const { data: recent } = await supabase
          .from('checkins')
          .select('id, date, completed')
          .eq('challenge_id', challenge.id)
          .in('date', [friendToday, friendYesterday])

        const todayCheckin = (recent ?? []).find((c) => c.date === friendToday && c.completed)
        const yesterdayCheckin = (recent ?? []).find(
          (c) => c.date === friendYesterday && c.completed
        )

        completedToday = !!todayCheckin
        completedYesterday = !!yesterdayCheckin
        activeCheckinId = todayCheckin?.id ?? yesterdayCheckin?.id ?? null
      }

      let myReactionEmoji: string | null = null
      if (activeCheckinId) {
        const { data: myReaction } = await supabase
          .from('reactions')
          .select('emoji')
          .eq('checkin_id', activeCheckinId)
          .eq('sender_id', userId)
          .maybeSingle()
        myReactionEmoji = myReaction?.emoji ?? null
      }

      return {
        id: p.id,
        nickname: p.nickname,
        username: p.username,
        goal: challenge?.goal ?? '',
        completedToday,
        completedYesterday,
        activeCheckinId,
        myReactionEmoji,
      }
    })
  )

  return results
}
