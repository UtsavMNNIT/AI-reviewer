import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login as loginApi, register as registerApi } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../utils/errors'
import type { LoginRequest, RegisterRequest, Role } from '../types/auth'

interface AuthContextValue {
  email: string | null
  name: string | null
  role: Role | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (req: LoginRequest) => void
  register: (req: RegisterRequest) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Provides authentication state + actions to the whole app. Session tokens are
 * persisted in the Zustand store (`authStore`); API calls run through React Query
 * mutations so components get loading/error handling for free.
 * Must render inside a Router (uses `useNavigate`).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.email)
  const name = useAuthStore((s) => s.name)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.logout)

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setSession(data)
      toast.success('Welcome back!')
      void navigate('/dashboard')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setSession(data)
      toast.success('Account created!')
      void navigate('/dashboard')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const logout = () => {
    clearSession()
    void navigate('/login')
  }

  const value: AuthContextValue = {
    email,
    name,
    role,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
