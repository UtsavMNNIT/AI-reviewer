import { useCallback, useEffect, useRef, useState } from 'react'

/** Resolves the Web Speech API constructor, or undefined if unsupported. */
function getRecognitionCtor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

interface Options {
  /** Called with each finalized transcript chunk. */
  onFinalResult: (text: string) => void
  lang?: string
}

interface SpeechRecognitionState {
  /** Whether the browser exposes the Web Speech API at all. */
  supported: boolean
  /** Whether the recognizer is currently capturing audio. */
  listening: boolean
  /** The current, not-yet-finalized transcript (live preview). */
  interim: string
  start: () => void
  stop: () => void
}

/**
 * Thin wrapper around the Web Speech API. Streams interim text via `interim` and
 * pushes finalized chunks to `onFinalResult`. The callback is kept in a ref so
 * the recognizer can be created once while always calling the latest handler
 * (important because the target changes as the interview advances questions).
 */
export function useSpeechRecognition({
  onFinalResult,
  lang = 'en-US',
}: Options): SpeechRecognitionState {
  const supported = Boolean(getRecognitionCtor())
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onFinalRef = useRef(onFinalResult)
  onFinalRef.current = onFinalResult

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let live = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          onFinalRef.current(text.trim())
        } else {
          live += text
        }
      }
      setInterim(live)
    }
    recognition.onerror = () => {
      setListening(false)
      setInterim('')
    }
    recognition.onend = () => {
      setListening(false)
      setInterim('')
    }

    recognitionRef.current = recognition
    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [lang])

  const start = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    try {
      recognition.start()
      setListening(true)
    } catch {
      // start() throws if already started — ignore and stay in the listening state.
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { supported, listening, interim, start, stop }
}
