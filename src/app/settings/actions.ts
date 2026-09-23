'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SettingsState = { error: string | null; success: string | null }

const REWARD_TARGETS = [7, 20, 50, 77, 100]

export async function updateRewards(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.', success: null }

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!challenge) return { error: '챌린지를 찾을 수 없어요.', success: null }

  for (const target of REWARD_TARGETS) {
    const title = String(formData.get(`reward${target}`) ?? '')
      .trim()
      .slice(0, 50)
    await supabase
      .from('rewards')
      .update({ title })
      .eq('challenge_id', challenge.id)
      .eq('target_count', target)
  }

  revalidatePath('/habit')
  revalidatePath('/settings')
  return { error: null, success: '저장했어요.' }
}

export async function updateGoal(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.', success: null }

  const goal = String(formData.get('goal') ?? '').trim()
  if (!goal || goal.length > 40) {
    return { error: '목표를 1~40자로 입력해주세요.', success: null }
  }

  const { error } = await supabase
    .from('challenges')
    .update({ goal })
    .eq('user_id', user.id)

  if (error) return { error: '저장하지 못했어요. 다시 시도해주세요.', success: null }

  revalidatePath('/main')
  revalidatePath('/habit')
  revalidatePath('/settings')
  return { error: null, success: '저장했어요.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
