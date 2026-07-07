/**
 * Mock performance-report data for the Results page.
 *
 * The backend does not yet expose aggregate/sub-scores (it only stores a single
 * per-answer score 0–100 and doesn't return it via GET). This module is the
 * single source the Report page reads, so it can later be swapped for a
 * react-query fetch via `services/` with minimal changes.
 */

export interface RadarPoint {
  subject: string
  score: number
}

export interface DistributionSlice {
  name: string
  value: number
}

export interface TimelinePoint {
  session: string
  score: number
}

export interface ReportData {
  overall: number
  technical: number
  communication: number
  coding: number
  radar: RadarPoint[]
  distribution: DistributionSlice[]
  timeline: TimelinePoint[]
}

export const reportData: ReportData = {
  overall: 78,
  technical: 82,
  communication: 74,
  coding: 71,
  radar: [
    { subject: 'Problem Solving', score: 80 },
    { subject: 'Communication', score: 74 },
    { subject: 'Technical Depth', score: 82 },
    { subject: 'Code Quality', score: 71 },
    { subject: 'Speed', score: 68 },
    { subject: 'Confidence', score: 77 },
  ],
  distribution: [
    { name: 'Strong', value: 12 },
    { name: 'Average', value: 6 },
    { name: 'Needs Work', value: 3 },
  ],
  timeline: [
    { session: 'May 12', score: 58 },
    { session: 'May 26', score: 64 },
    { session: 'Jun 09', score: 61 },
    { session: 'Jun 23', score: 72 },
    { session: 'Jul 01', score: 75 },
    { session: 'Jul 07', score: 78 },
  ],
}
