import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocalDateString, daysUntil, addDays } from '@/lib/date'
import { habitCellState } from '@/lib/habit'
import { HabitGridWithModal } from '@/components/HabitGridWithModal'

export default async function HabitDetailPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) redirect('/setup')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, goal, end_date, created_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!challenge) redirect('/setup')

  const today = getLocalDateString(profile.timezone)
  const joinDate = getLocalDateString(profile.timezone, new Date(challenge.created_at))

  const { data: checkins } = await supabase
    .from('checkins')
    .select('id, date, completed')
    .eq('challenge_id', challenge.id)
    .gte('date', joinDate)
    .lte('date', challenge.end_date)

  const completedByDate = new Map(
    (checkins ?? []).filter((c) => c.completed).map((c) => [c.date, true])
  )

  const completedCheckinIds = (checkins ?? []).filter((c) => c.completed).map((c) => c.id)
  const { data: reactions } =
    completedCheckinIds.length > 0
      ? await supabase.from('reactions').select('checkin_id').in('checkin_id', completedCheckinIds)
      : { data: [] }
  const reactedCheckinIds = new Set((reactions ?? []).map((r) => r.checkin_id))
  const checkinIdByDate = new Map((checkins ?? []).map((c) => [c.date, c.id]))

  const totalDays = daysUntil(joinDate, challenge.end_date) + 1
  const cells = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(joinDate, i)
    const checkinId = checkinIdByDate.get(date)
    return {
      date,
      state: habitCellState(date, today, joinDate, completedByDate.has(date)),
      hasReaction: !!checkinId && reactedCheckinIds.has(checkinId),
    }
  })

  const { data: rewards } = await supabase
    .from('rewards')
    .select('target_count, title, is_unlocked')
    .eq('challenge_id', challenge.id)
    .order('target_count', { ascending: true })

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">나의 100일</h1>
          <Link href="/main" className="text-xs text-text-secondary underline">
            메인으로
          </Link>
        </div>
        <p className="text-sm text-text-secondary">{challenge.goal}</p>

        {(rewards ?? []).length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-text-secondary">REWARDS</p>
            {(rewards ?? []).map((r) => (
              <div key={r.target_count} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">
                  {completedByDate.size}/{r.target_count}개 {r.is_unlocked && '✓'}
                </span>
                <span className="text-text-secondary">{r.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-4">
          <HabitGridWithModal cells={cells} />
        </div>
      </div>
    </main>
  )
}
