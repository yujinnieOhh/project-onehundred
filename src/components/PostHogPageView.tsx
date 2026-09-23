'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { getPostHog } from '@/lib/posthog-client'

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname
    getPostHog().capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}
