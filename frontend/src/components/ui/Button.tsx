import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    variant === 'primary'
      ? 'bg-brand-600 text-white hover:bg-brand-500'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={Boolean(disabled) || loading}
      {...rest}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}
