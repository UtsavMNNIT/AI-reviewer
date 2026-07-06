import { LogOut, Menu, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

interface Props {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: Props) {
  const { email, role, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
      <button
        className="text-slate-300 transition hover:text-white lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      <div className="hidden text-sm text-slate-400 lg:block">Welcome back</div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-sm text-slate-300">
          <UserCircle size={18} className="text-brand-400" />
          <span className="hidden sm:inline">{email}</span>
          {role && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {role}
            </span>
          )}
        </span>
        <Button variant="ghost" onClick={logout}>
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
