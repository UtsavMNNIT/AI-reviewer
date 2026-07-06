import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name
  return (
    <div className="flex flex-col gap-1 text-left">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        className={`rounded-lg border bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-brand-500 ${
          error ? 'border-red-500' : 'border-slate-700 focus:border-brand-500'
        }`}
        {...rest}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
})

export default TextField
