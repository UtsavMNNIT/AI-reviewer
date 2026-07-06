import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LoginRequest } from '../types/auth'
import { useAuth } from '../context/AuthContext'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()
  const { login, isLoading } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
    >
      <h1 className="mb-1 text-2xl font-semibold text-white">Sign in</h1>
      <p className="mb-6 text-sm text-slate-400">Welcome back.</p>
      <form onSubmit={handleSubmit((data) => login(data))} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email' },
          })}
          error={errors.email?.message}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
        />
        <Button type="submit" loading={isLoading}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{' '}
        <Link to="/register" className="font-medium text-brand-400 hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  )
}
