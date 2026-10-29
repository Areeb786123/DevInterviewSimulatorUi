import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type UseSpeechToTextOptions = {
  /** Called with the full text after each final chunk is appended. */
  onAppend: (chunk: string) => void
  lang?: string
}

export function useSpeechToText({
  onAppend,
  lang = 'en-US',
}: UseSpeechToTextOptions) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onAppendRef = useRef(onAppend)
  onAppendRef.current = onAppend

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() != null)
  }, [])

  const stop = useCallback(() => {
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('Speech-to-text is not supported in this browser.')
      return
    }

    stop()
    setError(null)

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = lang
    rec.onresult = (event) => {
      let chunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.isFinal) {
          chunk += result[0]?.transcript ?? ''
        }
      }
      const trimmed = chunk.trim()
      if (trimmed) onAppendRef.current(trimmed)
    }
    rec.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return
      setError(
        event.error === 'not-allowed'
          ? 'Microphone permission denied.'
          : `Speech error: ${event.error}`,
      )
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('Could not start the microphone.')
      setListening(false)
    }
  }, [lang, stop])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  useEffect(() => () => stop(), [stop])

  return { listening, supported, error, start, stop, toggle }
}
