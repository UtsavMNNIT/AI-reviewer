import { Award, BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import ScoreCard from '../components/charts/ScoreCard'
import PerformanceRadar from '../components/charts/PerformanceRadar'
import ScoreDistributionPie from '../components/charts/ScoreDistributionPie'
import PerformanceTimeline from '../components/charts/PerformanceTimeline'
import Button from '../components/ui/Button'
import { getInterviews } from '../services/interviewService'
import { getErrorMessage } from '../utils/errors'
import type { InterviewResponse, QuestionResponse } from '../types/interview'
import type {
  DistributionSlice,
  RadarPoint,
  TimelinePoint,
} from '../types/report'

/** Questions that have been answered and scored. */
function evaluated(interview: InterviewResponse): QuestionResponse[] {
  return (interview.questions ?? []).filter((q) => q.evaluation != null)
}

function average(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export default function ResultsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['interviews'],
    queryFn: getInterviews,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Loading your report…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-300">
        {getErrorMessage(error)}
      </div>
    )
  }

  // Only completed interviews that actually have scored answers count.
  const completed = (data ?? [])
    .filter((i) => i.status === 'COMPLETED' && evaluated(i).length > 0)
    .sort(
      (a, b) =>
        new Date(a.completedAt ?? 0).getTime() -
        new Date(b.completedAt ?? 0).getTime(),
    )

  if (completed.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-white">Performance Report</h1>
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-400">
            <BarChart3 size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              No interviews yet
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              You haven&apos;t completed any interviews, so there&apos;s nothing
              to report yet. Take one to see your scores and feedback here.
            </p>
          </div>
          <Link to="/interviews">
            <Button>Start an interview</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Latest completed interview drives the detailed breakdown.
  const latest = completed[completed.length - 1]
  const latestQuestions = evaluated(latest)
  const scores = latestQuestions.map((q) => q.evaluation!.score)
  const overall = average(scores)
  const strongest = Math.max(...scores)
  const weakest = Math.min(...scores)

  const radar: RadarPoint[] = latestQuestions.map((q) => ({
    subject: q.topic,
    score: q.evaluation!.score,
  }))

  const distribution: DistributionSlice[] = [
    { name: 'Strong', value: scores.filter((s) => s >= 75).length },
    { name: 'Average', value: scores.filter((s) => s >= 50 && s < 75).length },
    { name: 'Needs Work', value: scores.filter((s) => s < 50).length },
  ].filter((d) => d.value > 0)

  const timeline: TimelinePoint[] = completed.map((i) => ({
    session: new Date(i.completedAt ?? i.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    score: average(evaluated(i).map((q) => q.evaluation!.score)),
  }))

  const scoreCards = [
    { label: 'Overall Score', score: overall, icon: Award, accent: '#6366f1' },
    { label: 'Strongest Answer', score: strongest, icon: TrendingUp, accent: '#22c55e' },
    { label: 'Weakest Answer', score: weakest, icon: TrendingDown, accent: '#f59e0b' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Performance Report</h1>
      <p className="mt-1 text-sm text-slate-400">
        {latest.role} · {latestQuestions.length} question
        {latestQuestions.length === 1 ? '' : 's'} scored ·{' '}
        {new Date(latest.completedAt ?? latest.createdAt).toLocaleDateString()}
      </p>

      {/* Score tiles. */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {scoreCards.map(({ label, score, icon, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ScoreCard label={label} score={score} icon={icon} accent={accent} />
          </motion.div>
        ))}
      </div>

      {/* Radar + distribution side by side on large screens. */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PerformanceRadar data={radar} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ScoreDistributionPie data={distribution} />
        </motion.div>
      </div>

      {/* Timeline across past interviews. */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PerformanceTimeline data={timeline} />
      </motion.div>

      {/* Per-question feedback. */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Question feedback</h2>
        <div className="mt-4 flex flex-col gap-4">
          {latestQuestions.map((q, i) => {
            const ev = q.evaluation!
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-full bg-brand-600/15 px-3 py-1 text-xs font-medium text-brand-300">
                      {q.topic}
                    </span>
                    <p className="mt-2 font-medium text-white">{q.question}</p>
                  </div>
                  <span className="shrink-0 text-2xl font-semibold text-white tabular-nums">
                    {ev.score}
                    <span className="text-sm font-normal text-slate-500">/100</span>
                  </span>
                </div>
                {ev.summary && (
                  <p className="mt-3 text-sm text-slate-300">{ev.summary}</p>
                )}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FeedbackList title="Strengths" items={ev.strengths} tone="text-emerald-300" />
                  <FeedbackList title="Weaknesses" items={ev.weaknesses} tone="text-amber-300" />
                  <FeedbackList title="Suggestions" items={ev.suggestions} tone="text-brand-300" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string
  items?: string[]
  tone: string
}) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone}`}>
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-400">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
