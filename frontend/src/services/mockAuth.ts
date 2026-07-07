import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

// Mock adapter used while the backend auth endpoints are stubbed
// (they currently throw UnsupportedOperationException). Toggled by VITE_USE_MOCK.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Not a real JWT — a stand-in so the UI flow works end-to-end in dev.
const fakeToken = (email: string) => `mock.${btoa(email)}.${String(Date.now())}`

function buildResponse(email: string, name?: string): AuthResponse {
  return {
    accessToken: fakeToken(email),
    refreshToken: fakeToken(email),
    tokenType: 'Bearer',
    email,
    name: name ?? email.split('@')[0],
    role: 'USER',
  }
}

export async function mockLogin(req: LoginRequest): Promise<AuthResponse> {
  await delay(400)
  return buildResponse(req.email)
}

export async function mockRegister(req: RegisterRequest): Promise<AuthResponse> {
  await delay(400)
  return buildResponse(req.email, req.name)
}
