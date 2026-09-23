'use client'

import { createClient } from '@/lib/supabase/client'

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
      <div className="text-center">
        <p className="text-sm tracking-wide text-[#D9A7A7]">PROJECT</p>
        <p className="text-3xl font-bold text-text-primary">ONE HUNDRED</p>
      </div>
      <button
        onClick={handleLogin}
        className="rounded-full bg-text-primary px-6 py-3 text-white"
      >
        Continue with Google
      </button>
    </main>
  )
}
