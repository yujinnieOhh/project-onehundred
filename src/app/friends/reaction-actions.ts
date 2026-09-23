'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { REACTION_EMOJIS } from '@/lib/reactions'

export async function sendReaction(checkinId: string, emoji: string) {
  if (!REACTION_EMOJIS.includes(emoji)) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('reactions').insert({
    checkin_id: checkinId,
    sender_id: user.id,
    emoji,
  })

  revalidatePath('/main')
  revalidatePath('/friends')
}
