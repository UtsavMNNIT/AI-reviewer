import apiClient from './apiClient'
import type { ApiEnvelope, ResumeResponse } from '../types/resume'

/**
 * Uploads a PDF resume to the backend.
 *
 * The shared apiClient defaults Content-Type to application/json, so we override
 * it here for the multipart request — the browser still sets the boundary. The
 * request interceptor attaches the Bearer token automatically.
 */
export async function uploadResume(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ResumeResponse> {
  const form = new FormData()
  form.append('file', file) // field name must be "file"

  const { data } = await apiClient.post<ApiEnvelope<ResumeResponse>>(
    '/resumes/upload',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
      },
    },
  )

  return data.data // unwrap the ApiResponse envelope
}

/** Lists the authenticated user's uploaded resumes. */
export async function getResumes(): Promise<ResumeResponse[]> {
  const { data } = await apiClient.get<ApiEnvelope<ResumeResponse[]>>('/resumes')
  return data.data // unwrap the ApiResponse envelope
}
