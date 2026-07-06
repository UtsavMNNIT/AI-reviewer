import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { RegisterRequest } from '../types/auth'
import { useAuth } from '../context/AuthContext'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>()
  const { register: registerUser, isLoading } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
    >
      <h1 className="mb-1 text-2xl font-semibold text-white">Create account</h1>
      <p className="mb-6 text-sm text-slate-400">Join the AI Interview Platform.</p>
      <form
        onSubmit={handleSubmit((data) => registerUser(data))}
        className="flex flex-col gap-4"
      >
        <TextField
          label="Name"
          type="text"
          placeholder="Ada Lovelace"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
        />
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
          placeholder="At least 8 characters"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          })}
          error={errors.password?.message}
        />
        <Button type="submit" loading={isLoading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
