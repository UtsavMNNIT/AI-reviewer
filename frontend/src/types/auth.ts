// Types mirroring the backend DTOs (com.utsav.aiInterview.dto).

export type Role = 'USER' | 'ADMIN' | 'INTERVIEWER'

// AuthController → AuthResponse
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  email: string
  role: string
}

// AuthController → LoginRequest
export interface LoginRequest {
  email: string
  password: string
}

// AuthController → RegisterRequest
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

// UserController currently returns the raw User entity (includes `password`).
// `password` is typed optional here and must never be rendered.
export interface User {
  id: string
  name: string
  email: string
  role: Role
  password?: string
}
