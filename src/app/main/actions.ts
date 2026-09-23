'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getLocalDateString } from '@/lib/date'

async function getContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle()
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || !challenge) return null
  return { supabase, profile, challenge }
}

export async function markDone() {
  const ctx = await getContext()
  if (!ctx) return

  const today = getLocalDateString(ctx.profile.timezone)
  await ctx.supabase
    .from('checkins')
    .upsert(
      { challenge_id: ctx.challenge.id, date: today, completed: true },
      { onConflict: 'challenge_id,date' }
    )

  const { count } = await ctx.supabase
    .from('checkins')
    .select('id', { count: 'exact', head: true })
    .eq('challenge_id', ctx.challenge.id)
    .eq('completed', true)

  if (count) {
    await ctx.supabase
      .from('rewards')
      .update({ is_unlocked: true, unlocked_at: new Date().toISOString() })
      .eq('challenge_id', ctx.challenge.id)
      .eq('is_unlocked', false)
      .lte('target_count', count)
  }

  revalidatePath('/main')
  revalidatePath('/habit')
}

export async function saveNote(note: string) {
  const ctx = await getContext()
  if (!ctx) return

  const today = getLocalDateString(ctx.profile.timezone)
  await ctx.supabase
    .from('checkins')
    .upsert(
      { challenge_id: ctx.challenge.id, date: today, note },
      { onConflict: 'challenge_id,date' }
    )
  revalidatePath('/main')
}

export async function undoDone() {
  const ctx = await getContext()
  if (!ctx) return

  const today = getLocalDateString(ctx.profile.timezone)
  await ctx.supabase
    .from('checkins')
    .update({ completed: false })
    .eq('challenge_id', ctx.challenge.id)
    .eq('date', today)
  revalidatePath('/main')
}
