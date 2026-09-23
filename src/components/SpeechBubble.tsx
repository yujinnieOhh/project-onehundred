export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 rounded-2xl border border-border bg-surface px-4 py-3">
      {children}
      <div className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-border bg-surface" />
    </div>
  )
}
