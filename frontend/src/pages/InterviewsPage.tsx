import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Video } from 'lucide-react'
import Button from '../components/ui/Button'
import SearchableSelect from '../components/ui/SearchableSelect'
import { createInterview } from '../services/interviewService'
import { getRoles } from '../services/roleService'
import { getErrorMessage } from '../utils/errors'
import type { Difficulty } from '../types/interview'

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

export default function InterviewsPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM')

  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useQuery({ queryKey: ['roles'], queryFn: getRoles })

  const mutation = useMutation({
    mutationFn: () => createInterview({ role, difficulty }),
    onSuccess: (data) => navigate(`/interviews/${data.id}`),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) {
      toast.error('Please choose a role')
      return
    }
    mutation.mutate()
  }

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
            Choose the role you want to interview for.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
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
              disabled={mutation.isPending}
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
            disabled={mutation.isPending}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={mutation.isPending} disabled={!role}>
            Start interview
          </Button>
        </div>
      </form>

      {mutation.isPending && (
        <p className="mt-4 text-center text-xs text-slate-500">
          Generating questions — this can take a few seconds…
        </p>
      )}
    </motion.div>
  )
}
