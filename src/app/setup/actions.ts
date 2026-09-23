'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SetupState = { error: string | null }

export async function createProfile(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const nickname = String(formData.get('nickname') ?? '').trim()
  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase()
  const goal = String(formData.get('goal') ?? '').trim()
  const timezone = String(formData.get('timezone') ?? '').trim()
  const locale = String(formData.get('locale') ?? 'ko').trim()

  if (!nickname || nickname.length > 20) {
    return { error: '닉네임을 1~20자로 입력해주세요.' }
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: '유저네임은 영문 소문자/숫자/_ 3~20자로 입력해주세요.' }
  }
  if (!goal || goal.length > 40) {
    return { error: '목표를 1~40자로 입력해주세요.' }
  }
  if (!timezone) {
    return { error: '타임존을 확인하지 못했어요. 새로고침 후 다시 시도해주세요.' }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    nickname,
    username,
    locale,
    timezone,
  })

  if (profileError) {
    if (profileError.code === '23505') {
      return { error: '이미 사용 중인 유저네임이에요.' }
    }
    return { error: '프로필 생성에 실패했어요. 다시 시도해주세요.' }
  }

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .insert({ user_id: user.id, goal })
    .select('id')
    .single()

  if (challengeError || !challenge) {
    return { error: '챌린지 생성에 실패했어요. 다시 시도해주세요.' }
  }

  const rewardEntries = [
    { target_count: 50, title: String(formData.get('reward50') ?? '').trim() },
    { target_count: 77, title: String(formData.get('reward77') ?? '').trim() },
    { target_count: 100, title: String(formData.get('reward100') ?? '').trim() },
  ].filter((r) => r.title.length > 0 && r.title.length <= 50)

  if (rewardEntries.length > 0) {
    await supabase.from('rewards').insert(
      rewardEntries.map((r) => ({
        challenge_id: challenge.id,
        target_count: r.target_count,
        title: r.title,
      }))
    )
  }

  redirect('/main')
}
