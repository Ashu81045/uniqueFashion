import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${
        hover ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${className}`}
      {...props}
    />
  )
}
