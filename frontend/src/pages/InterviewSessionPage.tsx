import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Mic,
  MicOff,
  VideoOff,
} from 'lucide-react'
import Button from '../components/ui/Button'
import {
  completeInterview,
  getInterview,
  startInterview,
} from '../services/interviewService'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { getErrorMessage } from '../utils/errors'

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function InterviewSessionPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [currentIndex, setCurrentIndex] = useState(0)
  // Client-side only — the backend has no answer-submission endpoint.
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [elapsed, setElapsed] = useState(0)
  const [camError, setCamError] = useState(false)
  const startedRef = useRef(false)

  const {
    data: interview,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => getInterview(id),
    enabled: Boolean(id),
  })

  const startMutation = useMutation({
    mutationFn: () => startInterview(id),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const completeMutation = useMutation({
    mutationFn: () => completeInterview(id),
    onSuccess: () => {
      toast.success('Interview completed')
      navigate('/results')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  // Kick off the interview once, if it hasn't started yet.
  useEffect(() => {
    if (!interview || startedRef.current) return
    if (interview.status === 'UPCOMING') {
      startedRef.current = true
      startMutation.mutate()
    }
  }, [interview, startMutation])

  // Elapsed count-up timer, running until the interview is completed.
  const timerActive = Boolean(interview) && interview?.status !== 'COMPLETED'
  useEffect(() => {
    if (!timerActive) return
    const handle = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(handle)
  }, [timerActive])

  const speech = useSpeechRecognition({
    onFinalResult: (text) => {
      if (!text) return
    
      setAnswers((prev) => {
        const existing = prev[currentIndex] ?? ''
        return { ...prev, [currentIndex]: existing ? `${existing} ${text}` : text }
      })
    },
  })

  const questions = interview?.questions ?? []
  const total = questions.length
  const isLast = currentIndex === total - 1
  const current = questions[currentIndex]

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading interview…
      </div>
    )
  }

  if (isError || !interview) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-sm text-slate-300">
          {isError ? getErrorMessage(error) : 'Interview not found'}
        </p>
        <div className="mt-4">
          <Button variant="ghost" onClick={() => navigate('/interviews')}>
            Back to interviews
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-6xl flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">{interview.role}</h1>
          <p className="text-sm text-slate-400">
            {interview.difficulty} · Question {currentIndex + 1} of {total}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 tabular-nums">
          <Clock size={16} className="text-brand-400" />
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${total ? ((currentIndex + 1) / total) * 100 : 0}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Left column: webcam */}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="aspect-video w-full bg-slate-950">
              {camError ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
                  <VideoOff size={32} />
                  <p className="text-sm">
                    Camera unavailable. Grant camera permission and reload to
                    enable the proctored video.
                  </p>
                </div>
              ) : (
                <Webcam
                  audio={false}
                  mirrored
                  className="h-full w-full object-cover"
                  onUserMediaError={() => setCamError(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right column: question + answer + nav */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {current?.topic && (
              <span className="inline-block rounded-full bg-brand-600/15 px-3 py-1 text-xs font-medium text-brand-300">
                {current.topic}
              </span>
            )}
            <p className="mt-3 text-lg font-medium leading-relaxed text-white">
              {current?.question ?? 'No question available.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="answer"
                className="block text-sm font-semibold text-white"
              >
                Your answer
              </label>
              {speech.supported ? (
                <Button
                  variant="ghost"
                  onClick={() => (speech.listening ? speech.stop() : speech.start())}
                  className={speech.listening ? 'text-red-400 hover:text-red-300' : ''}
                >
                  {speech.listening ? (
                    <>
                      <MicOff size={16} /> Stop
                    </>
                  ) : (
                    <>
                      <Mic size={16} /> Record
                    </>
                  )}
                </Button>
              ) : (
                <span className="text-xs text-slate-500">
                  Not supported in this browser
                </span>
              )}
            </div>
            <textarea
              id="answer"
              value={answers[currentIndex] ?? ''}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [currentIndex]: e.target.value }))
              }
              placeholder="Type your answer, or press Record and speak…"
              className="h-48 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            {speech.listening && speech.interim && (
              <p className="mt-2 text-xs italic text-slate-500">
                {speech.interim}…
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} /> Previous
            </Button>

            {isLast ? (
              <Button
                onClick={() => completeMutation.mutate()}
                loading={completeMutation.isPending}
              >
                <Flag size={16} /> Finish interview
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}>
                Next <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
