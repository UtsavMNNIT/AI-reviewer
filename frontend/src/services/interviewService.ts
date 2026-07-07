import apiClient from './apiClient'
import type {
  AnswerEvaluation,
  ApiEnvelope,
  CreateInterviewRequest,
  InterviewResponse,
  NextQuestionResponse,
} from '../types/interview'

/**
 * Interview API client. Every backend response is wrapped in the ApiResponse
 * envelope, so each call unwraps `data.data`. The shared apiClient attaches the
 * Bearer token and handles 401 → logout automatically.
 */

/** Creates an interview instantly (no questions yet — they're generated one at a time). */
export async function createInterview(
  body: CreateInterviewRequest,
): Promise<InterviewResponse> {
  const { data } = await apiClient.post<ApiEnvelope<InterviewResponse>>(
    '/interviews',
    body,
  )
  return data.data
}

/** Generates the next interview question on demand. */
export async function generateNextQuestion(
  id: string,
): Promise<NextQuestionResponse> {
  const { data } = await apiClient.post<ApiEnvelope<NextQuestionResponse>>(
    `/interviews/${id}/questions/next`,
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

/** Lists the authenticated user's interviews (with questions + any evaluations). */
export async function getInterviews(): Promise<InterviewResponse[]> {
  const { data } = await apiClient.get<ApiEnvelope<InterviewResponse[]>>(
    '/interviews',
  )
  return data.data
}

/** Submits an answer for AI scoring; the score is stored on the interview. */
export async function evaluateAnswer(
  id: string,
  questionIndex: number,
  answer: string,
): Promise<AnswerEvaluation> {
  const { data } = await apiClient.post<ApiEnvelope<AnswerEvaluation>>(
    `/interviews/${id}/answer`,
    { questionIndex, answer },
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
