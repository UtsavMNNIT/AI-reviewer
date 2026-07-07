import type { ApiEnvelope } from './resume'

export type { ApiEnvelope }

/** Mirrors the backend Difficulty enum. */
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

/** Mirrors the backend InterviewStatus enum. */
export type InterviewStatus = 'UPCOMING' | 'RUNNING' | 'COMPLETED'

/** Mirrors the backend EvaluationResponse / AnswerEvaluation DTO. */
export interface AnswerEvaluation {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

/** Mirrors the backend QuestionResponse DTO (embedded on an interview). */
export interface QuestionResponse {
  question: string
  topic: string
  // Present only once the answer has been submitted and scored.
  answer?: string
  evaluation?: AnswerEvaluation
}

/** Mirrors the backend InterviewResponse DTO returned from /api/interviews. */
export interface InterviewResponse {
  id: string
  role: string
  difficulty: Difficulty
  status: InterviewStatus
  questions: QuestionResponse[]
  createdAt: string
  // Omitted by the backend (non_null inclusion) until the interview reaches the stage.
  startedAt?: string
  completedAt?: string
}

/** Request body for POST /api/interviews. */
export interface CreateInterviewRequest {
  resumeId: string
  role: string
  difficulty: Difficulty
}

/** Mirrors the backend JobRoleResponse DTO returned from /api/roles. */
export interface JobRole {
  id: string
  name: string
}

/** Mirrors the backend AtsReport — resume match against a target role. */
export interface AtsReport {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
}

/** Mirrors the backend NextQuestionResponse — one question generated on demand. */
export interface NextQuestionResponse {
  question: string
  topic: string
  questionNumber: number
  totalQuestions: number
}
