import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-slate-50 shadow-sm shadow-black/30 hover:bg-blue-500 hover:shadow-md disabled:bg-blue-300 disabled:shadow-none',
  // slate-200 (not slate-100) so secondary/ghost buttons stay visibly
  // distinct even when nested inside a Card (also bg-slate-100).
  secondary:
    'bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:text-slate-400 disabled:bg-slate-100',
  danger:
    'bg-red-600 text-white shadow-sm shadow-black/30 hover:bg-red-500 hover:shadow-md disabled:bg-red-300 disabled:shadow-none',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-200 disabled:text-slate-300',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
