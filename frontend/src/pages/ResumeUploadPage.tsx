import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { UploadCloud, FileText, X, CheckCircle2, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import {
  deleteResume,
  getResumes,
  uploadResume,
} from '../services/resumeService'
import { getErrorMessage } from '../utils/errors'
import type { ResumeResponse } from '../types/resume'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB — mirrors the backend limit

function isPdf(file: File): boolean {
  return (
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ResumeUploadPage() {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [uploaded, setUploaded] = useState<ResumeResponse | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Create / revoke the object URL as the selected file changes.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: getResumes,
  })

  const mutation = useMutation({
    mutationFn: (f: File) => uploadResume(f, setProgress),
    onSuccess: (data) => {
      toast.success('Resume uploaded successfully')
      setUploaded(data)
      void queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
      setProgress(0)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      toast.success('Resume deleted')
      void queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  function selectFile(candidate: File | undefined) {
    if (!candidate) return
    if (!isPdf(candidate)) {
      toast.error('Only PDF files are allowed')
      return
    }
    if (candidate.size > MAX_SIZE) {
      toast.error('File is too large (max 10 MB)')
      return
    }
    setProgress(0)
    setFile(candidate)
  }

  function clearFile() {
    setFile(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  function reset() {
    setUploaded(null)
    clearFile()
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    selectFile(e.dataTransfer.files?.[0])
  }

  function handleDelete(resume: ResumeResponse) {
    if (
      !window.confirm(
        `Delete "${resume.originalFilename}"? This can't be undone.`,
      )
    ) {
      return
    }
    deleteMutation.mutate(resume.id)
  }

  // ---- Top card: success view or uploader ----
  const topCard = uploaded ? (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="text-emerald-400" size={48} />
        <h1 className="text-xl font-semibold text-white">Resume uploaded</h1>
        <div className="w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-left text-sm">
          <div className="flex items-center gap-2 text-white">
            <FileText size={18} className="text-brand-400" />
            <span className="truncate font-medium">
              {uploaded.originalFilename}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-slate-400">
            <dt>Size</dt>
            <dd className="text-right text-slate-300">
              {formatSize(uploaded.fileSize)}
            </dd>
            <dt>Uploaded</dt>
            <dd className="text-right text-slate-300">
              {new Date(uploaded.uploadedAt).toLocaleString()}
            </dd>
          </dl>
        </div>
        <Button onClick={reset}>Upload another</Button>
      </div>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
    >
      <h1 className="text-xl font-semibold text-white">Upload your resume</h1>
      <p className="mt-1 text-sm text-slate-400">PDF only, up to 10&nbsp;MB.</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => selectFile(e.target.files?.[0])}
      />

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition ${
            dragging
              ? 'border-brand-500 bg-brand-600/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <UploadCloud className="text-brand-400" size={40} />
          <p className="text-sm text-slate-300">
            Drag &amp; drop your PDF here, or{' '}
            <span className="font-medium text-brand-400">browse</span>
          </p>
          <p className="text-xs text-slate-500">Maximum file size 10 MB</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <FileText size={18} className="shrink-0 text-brand-400" />
              <span className="truncate text-white">{file.name}</span>
              <span className="shrink-0 text-slate-500">
                · {formatSize(file.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={clearFile}
              disabled={mutation.isPending}
              className="text-slate-400 transition hover:text-white disabled:opacity-50"
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          </div>

          {previewUrl && (
            <iframe
              src={previewUrl}
              title="Resume preview"
              className="h-96 w-full rounded-lg border border-slate-800 bg-white"
            />
          )}

          {mutation.isPending && (
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-slate-400">
                {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={clearFile}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate(file)}
              loading={mutation.isPending}
            >
              Upload
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {topCard}

      {/* Uploaded resumes — manage / delete to free space. */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-white">Your resumes</h2>
        <p className="mt-1 text-sm text-slate-400">
          Delete resumes you no longer need.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {resumesLoading && (
            <p className="text-sm text-slate-500">Loading…</p>
          )}
          {!resumesLoading && (!resumes || resumes.length === 0) && (
            <p className="text-sm text-slate-500">
              You haven&apos;t uploaded any resumes yet.
            </p>
          )}
          {resumes?.map((r) => {
            const deleting =
              deleteMutation.isPending && deleteMutation.variables === r.id
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <FileText size={18} className="shrink-0 text-brand-400" />
                  <span className="truncate text-white">
                    {r.originalFilename}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    · {new Date(r.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  disabled={deleting}
                  className="shrink-0 text-slate-400 transition hover:text-red-400 disabled:opacity-50"
                  aria-label={`Delete ${r.originalFilename}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
