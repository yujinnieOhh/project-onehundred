'use server'

import { createClient } from '@/lib/supabase/server'

export type DayDetail = {
  completed: boolean
  note: string | null
  reactions: { emoji: string; nickname: string; username: string }[]
}

export async function getDayDetail(date: string): Promise<DayDetail | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!challenge) return null

  const { data: checkin } = await supabase
    .from('checkins')
    .select('id, note, completed')
    .eq('challenge_id', challenge.id)
    .eq('date', date)
    .maybeSingle()

  let reactions: DayDetail['reactions'] = []

  if (checkin?.completed) {
    const { data: raw } = await supabase
      .from('reactions')
      .select('emoji, sender_id')
      .eq('checkin_id', checkin.id)

    const senderIds = (raw ?? []).map((r) => r.sender_id)
    const { data: senders } =
      senderIds.length > 0
        ? await supabase.from('profiles').select('id, nickname, username').in('id', senderIds)
        : { data: [] }
    const senderById = new Map((senders ?? []).map((s) => [s.id, s]))

    reactions = (raw ?? []).map((r) => {
      const s = senderById.get(r.sender_id)
      return { emoji: r.emoji, nickname: s?.nickname ?? '', username: s?.username ?? '' }
    })
  }

  return {
    completed: !!checkin?.completed,
    note: checkin?.note ?? null,
    reactions,
  }
}
