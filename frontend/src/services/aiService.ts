import apiClient from './apiClient'
import type { ApiEnvelope } from '../types/resume'
import type { AtsReport } from '../types/interview'

/**
 * AI analysis API. The ATS score rates how well a resume matches a target role.
 */

/** Scores a resume against a role, returning an ATS score + strengths + improvements. */
export async function getAtsScore(
  resumeId: string,
  role: string,
): Promise<AtsReport> {
  const { data } = await apiClient.post<ApiEnvelope<AtsReport>>('/ai/ats-score', {
    resumeId,
    role,
  })
  return data.data
}
