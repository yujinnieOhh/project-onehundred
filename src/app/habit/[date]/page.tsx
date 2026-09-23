import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDots } from '@/lib/date'

export default async function HabitDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!challenge) redirect('/setup')

  const { data: checkin } = await supabase
    .from('checkins')
    .select('id, note, completed')
    .eq('challenge_id', challenge.id)
    .eq('date', date)
    .maybeSingle()

  let reactions: { emoji: string; nickname: string; username: string }[] = []

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

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">{formatDots(date)}</h1>
          <Link href="/habit" className="text-xs text-text-secondary underline">
            전체보기
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary">
            {checkin?.completed ? '완료 ✓' : '미완료'}
          </p>
        </div>

        {checkin?.note && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 text-sm font-semibold text-text-secondary">메모</p>
            <p className="whitespace-pre-wrap text-sm text-text-primary">{checkin.note}</p>
          </div>
        )}

        {reactions.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 text-sm font-semibold text-text-secondary">친구 반응</p>
            <div className="flex flex-col gap-2">
              {reactions.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{r.emoji}</span>
                  <span className="text-text-primary">
                    {r.nickname} <span className="text-text-secondary">@{r.username}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
