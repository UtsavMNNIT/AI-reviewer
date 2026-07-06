import apiClient from './apiClient'
import { mockLogin, mockRegister } from './mockAuth'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function login(req: LoginRequest): Promise<AuthResponse> {
  if (USE_MOCK) return mockLogin(req)
  const { data } = await apiClient.post<AuthResponse>('/auth/login', req)
  return data
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  if (USE_MOCK) return mockRegister(req)
  const { data } = await apiClient.post<AuthResponse>('/auth/register', req)
  return data
}
