import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'
import { Clock, Code2, Save, Send } from 'lucide-react'
import Button from '../components/ui/Button'

/**
 * Coding round: a Monaco-backed editor with a question panel, countdown timer,
 * language selector, and Save/Submit actions. Client-side only — there is no
 * backend code-submission endpoint yet, so drafts persist to localStorage
 * (mirroring how interview answers are kept purely on the client).
 */

interface Language {
  id: string
  label: string
  starter: string
}

const LANGUAGES: Language[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    starter: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    starter: `function twoSum(nums: number[], target: number): number[] {
  // Your code here
  return []
}`,
  },
  {
    id: 'python',
    label: 'Python',
    starter: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Your code here
        pass`,
  },
  {
    id: 'java',
    label: 'Java',
    starter: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    starter: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}`,
  },
]

const STORAGE_KEY = 'coding-round-draft'
const DURATION_SECONDS = 45 * 60

interface Draft {
  language: string
  code: Record<string, string>
}

/** Reads a persisted draft from localStorage, tolerating malformed data. */
function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function CodingRoundPage() {
  const [language, setLanguage] = useState<string>(
    () => loadDraft()?.language ?? 'javascript',
  )
  // One buffer per language, seeded from the starter and hydrated from any draft.
  const [code, setCode] = useState<Record<string, string>>(() => {
    const saved = loadDraft()?.code ?? {}
    const initial: Record<string, string> = {}
    for (const lang of LANGUAGES) initial[lang.id] = saved[lang.id] ?? lang.starter
    return initial
  })
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS)
  const [submitted, setSubmitted] = useState(false)

  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, code }))
      return true
    } catch {
      return false
    }
  }, [language, code])

  // Countdown timer — ticks down to zero, then stops. Freezes once submitted.
  useEffect(() => {
    if (submitted) return
    const handle = setInterval(
      () => setSecondsLeft((s) => (s <= 0 ? 0 : s - 1)),
      1000,
    )
    return () => clearInterval(handle)
  }, [submitted])

  // Auto-submit when the clock runs out.
  useEffect(() => {
    if (secondsLeft === 0 && !submitted) {
      setSubmitted(true)
      persist()
      toast('Time is up — your code was auto-submitted.', { icon: '⏰' })
    }
  }, [secondsLeft, submitted, persist])

  const handleSave = () => {
    if (persist()) toast.success('Code saved')
    else toast.error('Could not save code')
  }

  const handleSubmit = () => {
    if (submitted) return
    setSubmitted(true)
    persist()
    toast.success('Code submitted!')
  }

  const lowTime = secondsLeft <= 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-7xl flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Code2 size={22} className="text-brand-400" />
            Coding Round
          </h1>
          <p className="text-sm text-slate-400">
            Solve the problem in the editor, then submit before the timer ends.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium tabular-nums ${
            lowTime
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-slate-800 bg-slate-900 text-slate-200'
          }`}
        >
          <Clock size={16} className={lowTime ? 'text-red-400' : 'text-brand-400'} />
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Question panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">1. Two Sum</h2>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
              Easy
            </span>
          </div>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>
              Given an array of integers <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">nums</code>{' '}
              and an integer{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">target</code>, return the
              indices of the two numbers that add up to{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">target</code>.
            </p>
            <p>
              You may assume that each input has exactly one solution, and you may
              not use the same element twice. You can return the answer in any
              order.
            </p>

            <div>
              <p className="mb-1 font-semibold text-slate-200">Example 1</p>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
{`Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Reason: nums[0] + nums[1] == 9`}
              </pre>
            </div>

            <div>
              <p className="mb-1 font-semibold text-slate-200">Example 2</p>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
{`Input:  nums = [3, 2, 4], target = 6
Output: [1, 2]`}
              </pre>
            </div>

            <div>
              <p className="mb-1 font-semibold text-slate-200">Constraints</p>
              <ul className="list-inside list-disc space-y-1 text-slate-400">
                <li>2 ≤ nums.length ≤ 10⁴</li>
                <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                <li>Only one valid answer exists.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <label htmlFor="language" className="text-xs font-medium text-slate-400">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleSave}>
                <Save size={16} /> Save
              </Button>
              <Button onClick={handleSubmit} disabled={submitted}>
                <Send size={16} /> {submitted ? 'Submitted' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Monaco editor */}
          <div className="h-[55vh] min-h-[380px] w-full">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code[language] ?? ''}
              onChange={(value) =>
                setCode((prev) => ({ ...prev, [language]: value ?? '' }))
              }
              loading={
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading editor…
                </div>
              }
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                readOnly: submitted,
                padding: { top: 12 },
              }}
            />
          </div>

          {submitted && (
            <div className="border-t border-slate-800 bg-emerald-500/10 px-4 py-2 text-center text-xs font-medium text-emerald-300">
              Your solution has been submitted. The editor is now read-only.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
