import apiClient from './apiClient'
import type {
  ApiEnvelope,
  CreateInterviewRequest,
  InterviewResponse,
} from '../types/interview'

/**
 * Interview API client. Every backend response is wrapped in the ApiResponse
 * envelope, so each call unwraps `data.data`. The shared apiClient attaches the
 * Bearer token and handles 401 → logout automatically.
 */

/** Creates an interview — the backend synchronously generates 8 questions via Gemini. */
export async function createInterview(
  body: CreateInterviewRequest,
): Promise<InterviewResponse> {
  const { data } = await apiClient.post<ApiEnvelope<InterviewResponse>>(
    '/interviews',
    body,
  )
  return data.data
}

/** Fetches a single interview (with its questions) by id. */
export async function getInterview(id: string): Promise<InterviewResponse> {
  const { data } = await apiClient.get<ApiEnvelope<InterviewResponse>>(
    `/interviews/${id}`,
  )
  return data.data
}

/** Transitions an interview UPCOMING → RUNNING. */
export async function startInterview(id: string): Promise<InterviewResponse> {
  const { data } = await apiClient.post<ApiEnvelope<InterviewResponse>>(
    `/interviews/${id}/start`,
  )
  return data.data
}

/** Transitions an interview RUNNING → COMPLETED. */
export async function completeInterview(
  id: string,
): Promise<InterviewResponse> {
  const { data } = await apiClient.post<ApiEnvelope<InterviewResponse>>(
    `/interviews/${id}/complete`,
  )
  return data.data
}
