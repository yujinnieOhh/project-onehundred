import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocalDateString, daysUntil } from '@/lib/date'
import { DoneButton } from '@/components/DoneButton'

export default async function MainPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, timezone')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) redirect('/setup')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, goal, end_date')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!challenge) redirect('/setup')

  const today = getLocalDateString(profile.timezone)
  const dDay = daysUntil(today, challenge.end_date)

  const { data: todayCheckin } = await supabase
    .from('checkins')
    .select('id')
    .eq('challenge_id', challenge.id)
    .eq('date', today)
    .maybeSingle()

  const { count: doneCount } = await supabase
    .from('checkins')
    .select('id', { count: 'exact', head: true })
    .eq('challenge_id', challenge.id)

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-around rounded-xl border border-border bg-surface p-4 text-center">
          <div>
            <p className="text-xl font-bold text-text-primary">
              {dDay > 0 ? `D-${dDay}` : 'D-DAY'}
            </p>
            <p className="text-xs text-text-secondary">12/31까지</p>
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">{doneCount ?? 0}개</p>
            <p className="text-xs text-text-secondary">완료</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-sm font-semibold text-text-secondary">TODAY&apos;S GOAL</p>
          <p className="text-lg font-bold text-text-primary">{challenge.goal}</p>
          <DoneButton completedToday={!!todayCheckin} />
        </div>
      </div>
    </main>
  )
}
