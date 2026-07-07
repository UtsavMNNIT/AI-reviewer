import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, Role } from '../types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  email: string | null
  name: string | null
  role: Role | null
  isAuthenticated: boolean
  setSession: (res: AuthResponse) => void
  logout: () => void
}

/**
 * Auth state, persisted to localStorage. Single source of truth for the
 * session — the Axios request interceptor reads the access token from here.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      email: null,
      name: null,
      role: null,
      isAuthenticated: false,
      setSession: (res) =>
        set({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          email: res.email,
          name: res.name,
          role: res.role as Role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          email: null,
          name: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'ai-interview-auth' },
  ),
)
