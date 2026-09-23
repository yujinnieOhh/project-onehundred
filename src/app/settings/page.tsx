import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RewardsSettingsForm } from '@/components/RewardsSettingsForm'
import { GoalSettingsForm } from '@/components/GoalSettingsForm'
import { signOut } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, goal')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!challenge) redirect('/setup')

  const { data: rewards } = await supabase
    .from('rewards')
    .select('target_count, title')
    .eq('challenge_id', challenge.id)
    .order('target_count', { ascending: true })

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">설정</h1>
          <Link href="/main" className="text-xs text-text-secondary underline">
            메인으로
          </Link>
        </div>
        <GoalSettingsForm goal={challenge.goal} />
        <RewardsSettingsForm rewards={rewards ?? []} />

        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-full border border-border bg-surface px-6 py-3 font-semibold text-text-primary"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  )
}
