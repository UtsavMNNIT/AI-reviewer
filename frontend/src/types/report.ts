// Shared shapes for the performance-report charts.

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
