import apiClient from './apiClient'
import type { ApiEnvelope } from '../types/resume'
import type { JobRole } from '../types/interview'

/**
 * Role catalog API. Roles are managed in the backend `job_roles` collection;
 * the frontend simply renders whatever active roles the API returns.
 */

/** Fetches the active interview roles a candidate can choose from. */
export async function getRoles(): Promise<JobRole[]> {
  const { data } = await apiClient.get<ApiEnvelope<JobRole[]>>('/roles')
  return data.data
}
