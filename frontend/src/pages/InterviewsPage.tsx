import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AlertTriangle, CheckCircle2, Video } from 'lucide-react'
import Button from '../components/ui/Button'
import SearchableSelect from '../components/ui/SearchableSelect'
import ThinkingDots from '../components/ui/ThinkingDots'
import { createInterview } from '../services/interviewService'
import { getRoles } from '../services/roleService'
import { getResumes } from '../services/resumeService'
import { getAtsScore } from '../services/aiService'
import { getErrorMessage } from '../utils/errors'
import type { AtsReport, Difficulty } from '../types/interview'

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

function scoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export default function InterviewsPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [resumeId, setResumeId] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM')
  const [ats, setAts] = useState<AtsReport | null>(null)

  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useQuery({ queryKey: ['roles'], queryFn: getRoles })

  const {
    data: resumes,
    isLoading: resumesLoading,
    isError: resumesError,
  } = useQuery({ queryKey: ['resumes'], queryFn: getResumes })

  // Newest first — drives both the dropdown order and the default selection.
  const sortedResumes = useMemo(
    () =>
      [...(resumes ?? [])].sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      ),
    [resumes],
  )

  // Pre-select the most recent resume once the list loads.
  useEffect(() => {
    if (!resumeId && sortedResumes.length > 0) {
      setResumeId(sortedResumes[0].id)
    }
  }, [resumeId, sortedResumes])

  // A shown ATS report is only valid for the selected resume+role; clear on change.
  useEffect(() => {
    setAts(null)
  }, [role, resumeId])

  const atsMutation = useMutation({
    mutationFn: () => getAtsScore(resumeId, role),
    onSuccess: (report) => setAts(report),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const createMutation = useMutation({
    mutationFn: () => createInterview({ resumeId, role, difficulty }),
    onSuccess: (data) => navigate(`/interviews/${data.id}`),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const busy = atsMutation.isPending || createMutation.isPending

  function onCheckAts(e: React.FormEvent) {
    e.preventDefault()
    if (!resumeId) {
      toast.error('Please choose a resume')
      return
    }
    if (!role) {
      toast.error('Please choose a role')
      return
    }
    atsMutation.mutate()
  }

  const hasResumes = sortedResumes.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-400">
          <Video size={22} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-white">Start an interview</h1>
          <p className="text-sm text-slate-400">
            Pick a resume and role, check your ATS match, then start.
          </p>
        </div>
      </div>

      <form onSubmit={onCheckAts} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="resume" className="text-sm font-medium text-slate-300">
            Resume
          </label>
          {resumesLoading && (
            <p className="text-sm text-slate-500">Loading resumes…</p>
          )}
          {resumesError && (
            <p className="text-sm text-red-400">
              Couldn&apos;t load your resumes. Please try again later.
            </p>
          )}
          {!resumesLoading && !resumesError && !hasResumes && (
            <p className="text-sm text-slate-400">
              You haven&apos;t uploaded a resume yet.{' '}
              <Link
                to="/resumes"
                className="font-medium text-brand-400 hover:underline"
              >
                Upload one first
              </Link>{' '}
              to start an interview.
            </p>
          )}
          {!resumesLoading && !resumesError && hasResumes && (
            <select
              id="resume"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              disabled={busy}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            >
              {sortedResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.originalFilename} —{' '}
                  {new Date(r.uploadedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="role" className="text-sm font-medium text-slate-300">
            Role
          </label>
          {rolesError ? (
            <p className="text-sm text-red-400">
              Couldn&apos;t load roles. Please try again later.
            </p>
          ) : (
            <SearchableSelect
              id="role"
              options={roles ?? []}
              value={role}
              onChange={setRole}
              placeholder="Search for a role…"
              loading={rolesLoading}
              disabled={busy}
            />
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label
            htmlFor="difficulty"
            className="text-sm font-medium text-slate-300"
          >
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={busy}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* ATS analysis in progress */}
        {atsMutation.isPending && (
          <ThinkingDots label="Analyzing your resume for this role…" />
        )}

        {/* ATS report */}
        {ats && !atsMutation.isPending && <AtsReportCard report={ats} />}

        <div className="flex justify-end gap-2">
          {!ats ? (
            <Button
              type="submit"
              loading={atsMutation.isPending}
              disabled={!role || !resumeId}
            >
              Check ATS score
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="ghost"
                loading={atsMutation.isPending}
              >
                Re-check
              </Button>
              <Button
                type="button"
                onClick={() => createMutation.mutate()}
                loading={createMutation.isPending}
              >
                Start interview
              </Button>
            </>
          )}
        </div>
      </form>

      {createMutation.isPending && (
        <p className="mt-4 text-center text-xs text-slate-500">
          Starting interview…
        </p>
      )}
    </motion.div>
  )
}

function AtsReportCard({ report }: { report: AtsReport }) {
  const color = scoreColor(report.score)
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 text-xl font-semibold text-white"
          style={{ borderColor: color }}
        >
          {report.score}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            ATS match score:{' '}
            <span style={{ color }}>{report.score}/100</span>
          </p>
          {report.summary && (
            <p className="mt-1 text-sm text-slate-400">{report.summary}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FeedbackList
          title="Plus points"
          items={report.strengths}
          icon={<CheckCircle2 size={14} className="text-emerald-400" />}
          tone="text-emerald-300"
        />
        <FeedbackList
          title="Needs enhancement"
          items={report.improvements}
          icon={<AlertTriangle size={14} className="text-amber-400" />}
          tone="text-amber-300"
        />
      </div>
    </div>
  )
}

function FeedbackList({
  title,
  items,
  icon,
  tone,
}: {
  title: string
  items?: string[]
  icon: React.ReactNode
  tone: string
}) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${tone}`}>
        {icon} {title}
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-400">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
