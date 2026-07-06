import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
      <h1 className="text-6xl font-bold text-brand-500">404</h1>
      <p className="text-slate-400">This page could not be found.</p>
      <Link to="/" className="font-medium text-brand-400 hover:underline">
        Go home
      </Link>
    </div>
  )
}
