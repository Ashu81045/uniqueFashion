type Tone = 'brand' | 'white'

const toneClasses: Record<Tone, string> = {
  brand: 'border-slate-300 border-t-blue-600',
  white: 'border-white/30 border-t-white',
}

export function Spinner({ tone = 'brand', className = '' }: { tone?: Tone; className?: string }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 ${toneClasses[tone]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
