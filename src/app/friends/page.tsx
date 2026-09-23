import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAcceptedFriendsWithActivity } from '@/lib/friends'
import { FriendRequestForm } from '@/components/FriendRequestForm'
import { AcceptFriendButton } from '@/components/AcceptFriendButton'
import { ReactionPicker } from '@/components/ReactionPicker'

export default async function FriendsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) redirect('/setup')

  const { data: incomingRaw } = await supabase
    .from('friendships')
    .select('id, requester_id')
    .eq('status', 'pending')
    .eq('addressee_id', user.id)

  const requesterIds = (incomingRaw ?? []).map((f) => f.requester_id)
  const { data: requesterProfiles } =
    requesterIds.length > 0
      ? await supabase.from('profiles').select('id, nickname, username').in('id', requesterIds)
      : { data: [] }

  const requesterById = new Map((requesterProfiles ?? []).map((p) => [p.id, p]))
  const incoming = (incomingRaw ?? [])
    .map((f) => {
      const p = requesterById.get(f.requester_id)
      return p ? { friendshipId: f.id, nickname: p.nickname, username: p.username } : null
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)

  const friends = await getAcceptedFriendsWithActivity(supabase, user.id)

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-xl font-bold text-text-primary">친구</h1>

        <FriendRequestForm />

        {incoming.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-text-secondary">받은 요청</p>
            {incoming.map((f) => (
              <div key={f.friendshipId} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">
                  {f.nickname} <span className="text-text-secondary">@{f.username}</span>
                </span>
                <AcceptFriendButton friendshipId={f.friendshipId} />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-secondary">내 친구</p>
          {friends.length === 0 && (
            <p className="text-sm text-text-secondary">아직 친구가 없어요.</p>
          )}
          {friends.map((f) => (
            <div key={f.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0">
              <p className="text-sm font-semibold text-text-primary">
                {f.nickname} <span className="text-text-secondary">@{f.username}</span>
              </p>
              {f.goal && <p className="text-xs text-text-secondary">{f.goal}</p>}
              {f.activeCheckinId && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-pink-deep">
                    {f.completedToday ? '오늘 완료 ✓' : '어제 완료 ✓'}
                  </p>
                  <ReactionPicker
                    checkinId={f.activeCheckinId}
                    myReactionEmoji={f.myReactionEmoji}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
