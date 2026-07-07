import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

interface Option {
  id: string
  name: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (name: string) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  id?: string
}

/**
 * A search-as-you-type dropdown (combobox). Clicking the field opens a menu of
 * options; typing filters them. Selection is by name so it maps directly to the
 * value the caller needs.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  disabled = false,
  loading = false,
  id,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Show everything when there's no query or the query still equals the
    // current selection (i.e. the user just re-opened the menu).
    if (!q || query === value) return options
    return options.filter((o) => o.name.toLowerCase().includes(q))
  }, [options, query, value])

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Keep the input text in sync with the external value while closed.
  useEffect(() => {
    if (!open) setQuery(value)
  }, [value, open])

  function openMenu() {
    if (disabled || loading) return
    setOpen(true)
    setHighlight(0)
  }

  function select(name: string) {
    onChange(name)
    setQuery(name)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) return openMenu()
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[highlight]) {
        e.preventDefault()
        select(filtered[highlight].name)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={id ? `${id}-listbox` : undefined}
          autoComplete="off"
          value={open ? query : value}
          placeholder={loading ? 'Loading roles…' : placeholder}
          disabled={disabled || loading}
          onFocus={openMenu}
          onClick={openMenu}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-9 text-sm text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
        />
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && !loading && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No matching roles</li>
          )}
          {filtered.map((o, i) => {
            const selected = o.name === value
            return (
              <li
                key={o.id}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  // Prevent the input blur from closing the menu before the click.
                  e.preventDefault()
                  select(o.name)
                }}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                  i === highlight ? 'bg-slate-800 text-white' : 'text-slate-300'
                }`}
              >
                <span>{o.name}</span>
                {selected && <Check size={15} className="text-brand-400" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
