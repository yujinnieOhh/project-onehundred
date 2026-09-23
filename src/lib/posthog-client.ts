import posthog from 'posthog-js'

let initialized = false

export function getPostHog() {
  if (!initialized && typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false, // captured manually so App Router route changes are tracked
    })
    initialized = true
  }
  return posthog
}
