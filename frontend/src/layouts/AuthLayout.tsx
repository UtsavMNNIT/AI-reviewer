import { Outlet } from 'react-router-dom'
import { Brain } from 'lucide-react'

/** Centered shell for the public auth pages (login / register). */
export default function AuthLayout() {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2 text-white">
          <Brain className="text-brand-400" size={28} />
          <span className="text-xl font-semibold">AI Interview Platform</span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
