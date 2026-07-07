import { Code2, Video, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MotionLink = motion.create(Link)

const features = [
  {
    icon: Video,
    title: 'Start an interview',
    description: 'Launch a proctored session with live video and questions.',
    to: '/interviews',
  },
  {
    icon: Code2,
    title: 'Coding challenge',
    description: 'Solve problems in an in-browser editor with real-time feedback.',
    to: '/coding',
  },
  {
    icon: BarChart3,
    title: 'Results & analytics',
    description: 'Review past sessions, scores, and performance trends.',
    to: '/results',
  },
]

export default function DashboardPage() {
  const { name, email } = useAuth()
  const displayName = name ?? email

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">
        Welcome{displayName ? `, ${displayName}` : ''}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        This is a placeholder dashboard. Feature pages will land in a later pass.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description, to }, i) => (
          <MotionLink
            key={title}
            to={to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left shadow-sm transition hover:border-brand-500/60 hover:bg-slate-800/60"
          >
            <div className="mb-3 inline-flex rounded-xl bg-brand-500/10 p-2 text-brand-400">
              <Icon size={22} />
            </div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </MotionLink>
        ))}
      </div>
    </div>
  )
}
