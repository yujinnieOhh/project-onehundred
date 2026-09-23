'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type FriendRequestState = { error: string | null; success: string | null }

export async function sendFriendRequest(
  _prev: FriendRequestState,
  formData: FormData
): Promise<FriendRequestState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.', success: null }

  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase()
  if (!username) return { error: '유저네임을 입력해주세요.', success: null }

  const { data: target } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (!target) return { error: '해당 유저네임을 찾을 수 없어요.', success: null }
  if (target.id === user.id) return { error: '나 자신에게는 요청할 수 없어요.', success: null }

  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: target.id,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: '이미 친구이거나 요청을 보낸 상태예요.', success: null }
    }
    return { error: '요청을 보내지 못했어요.', success: null }
  }

  revalidatePath('/friends')
  return { error: null, success: '친구 요청을 보냈어요.' }
}

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)

  revalidatePath('/friends')
  revalidatePath('/main')
}
