import { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'primary' | 'gold' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const STYLES: Record<Variant, string> = {
  default: 'border border-[var(--line)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--ink)]',
  primary: 'border border-[var(--navy)] bg-[var(--navy)] text-white hover:bg-[var(--navy-deep)]',
  gold:    'border border-[var(--gold)] bg-[var(--gold)] text-[var(--navy-deep)] font-semibold hover:bg-[#d4b56e]',
  ghost:   'border border-transparent bg-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[11.5px]',
  md: 'px-4 py-2 text-[12px]',
}

export function Button({ variant = 'default', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center gap-1.5 rounded-[5px] font-medium
        transition-all duration-150 cursor-pointer disabled:opacity-50
        ${STYLES[variant]} ${SIZES[size]} ${className}
      `}
    />
  )
}
