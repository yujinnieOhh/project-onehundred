'use client'

import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

export default function Home() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-5">
      <Logo />
      <button
        onClick={handleLogin}
        className="rounded-full bg-text-primary px-6 py-3 text-white"
      >
        Continue with Google
      </button>
    </main>
  )
}
