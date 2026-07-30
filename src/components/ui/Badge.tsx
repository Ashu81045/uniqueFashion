import type { ReactNode } from 'react'

type Tone = 'green' | 'amber' | 'red' | 'slate'

const toneClasses: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
}

const dotClasses: Record<Tone, string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
}

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {children}
    </span>
  )
}
