import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetupForm } from '@/components/SetupForm'

export default async function SetupPage() {
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

  if (profile) redirect('/main')

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg">
      <SetupForm />
    </main>
  )
}
