export function Logo({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  if (size === 'sm') {
    return (
      <span className="font-logo text-sm">
        <span className="text-logo-project">PROJECT</span>{' '}
        <span className="text-logo-one">ONE</span>{' '}
        <span className="text-logo-hundred">HUNDRED</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center font-logo">
      <span className="text-sm tracking-[0.2em] text-logo-project">PROJECT</span>
      <span className="text-4xl leading-tight">
        <span className="text-logo-one">ONE</span>{' '}
        <span className="text-logo-hundred">HUNDRED</span>
      </span>
    </div>
  )
}
