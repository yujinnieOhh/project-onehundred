'use server'

import { revalidatePath } from 'next/cache'
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
