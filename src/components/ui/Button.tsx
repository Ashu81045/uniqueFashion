import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:bg-blue-300 disabled:shadow-none',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:text-slate-400 disabled:bg-slate-50',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md disabled:bg-red-300 disabled:shadow-none',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 disabled:text-slate-300',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
