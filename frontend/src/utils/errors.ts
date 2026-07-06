import { AxiosError } from 'axios'

/** Extracts a user-facing message from an unknown error (Axios / Error / other). */
export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    // Backend wraps errors as ApiResponse { success, message, data }.
    const data = err.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (err.response?.status) return `Request failed (${err.response.status})`
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}
