/** Generic backend envelope: every API response is wrapped in ApiResponse. */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** Mirrors the backend ResumeResponse DTO returned from /api/resumes. */
export interface ResumeResponse {
  id: string
  originalFilename: string
  contentType: string
  fileSize: number
  extractedText: string
  uploadedAt: string
}
