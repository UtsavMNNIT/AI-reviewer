import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
}

/** Simple dark placeholder for feature pages not yet implemented. */
export default function PagePlaceholder({ icon: Icon, title, description }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 py-20 text-center">
        <div className="inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-400">
          <Icon size={28} />
        </div>
        <p className="text-sm text-slate-500">Coming soon.</p>
      </div>
    </div>
  )
}
