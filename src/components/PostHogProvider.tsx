'use client'

import { useEffect } from 'react'
import { getPostHog } from '@/lib/posthog-client'
import { createClient } from '@/lib/supabase/client'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthog = getPostHog()
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        posthog.identify(data.user.id, { email: data.user.email })
      }
    })
  }, [])

  return <>{children}</>
}
