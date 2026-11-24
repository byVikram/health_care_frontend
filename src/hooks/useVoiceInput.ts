// src/hooks/useVoiceInput.ts
//
// Speak-to-search for the web (the counterpart of the native app's useVoiceSearch): the browser's SpeechRecognition, one phrase at a time. It hands back
// ONE final text, which the field puts in its normal search state, so the page's own debounce / search runs as if the user had typed it.
//
// - Works in Chrome, Edge and Safari (SpeechRecognition / webkitSpeechRecognition); Firefox has none, which is said in a message instead of failing silently.
// - Needs a secure page (https or localhost) and the microphone permission; a refusal is explained.
// - English, en-IN first, en-US when the browser does not offer en-IN.
// - A second tap on the mic stops listening. Leaving the page (unmount) ends the session. One session at a time, page-wide: starting a new one stops the old one.
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type SpeechRecognitionResultLike = ArrayLike<{ transcript: string }>
interface RecognitionEvent {
	results: ArrayLike<SpeechRecognitionResultLike>
}
interface RecognitionErrorEvent {
	error: string
}
interface Recognition {
	lang: string
	continuous: boolean
	interimResults: boolean
	maxAlternatives: number
	start: () => void
	stop: () => void
	abort: () => void
	onresult: ((event: RecognitionEvent) => void) | null
	onerror: ((event: RecognitionErrorEvent) => void) | null
	onend: (() => void) | null
}
type RecognitionConstructor = new () => Recognition

const PREFERRED_LOCALE = 'en-IN'
const FALLBACK_LOCALE = 'en-US'

/** The browser's recogniser, or null when it has none (Firefox, an old browser). */
const recognitionConstructor = (): RecognitionConstructor | null => {
	if (typeof window === 'undefined') return null
	const w = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

// The one session that is open right now, whichever field owns it.
let stopActive: (() => void) | null = null

export function useVoiceInput(onResult: (text: string) => void) {
	const [listening, setListening] = useState(false)
	const recognitionRef = useRef<Recognition | null>(null)
	const onResultRef = useRef(onResult)
	const stopRef = useRef<() => void>(() => undefined)

	useEffect(() => {
		onResultRef.current = onResult
	}, [onResult])

	const supported = recognitionConstructor() !== null

	const stop = useCallback(() => {
		recognitionRef.current?.stop()
	}, [])

	const start = useCallback(() => {
		const Ctor = recognitionConstructor()
		if (!Ctor) {
			toast.info('Voice search is not supported in this browser. Please use Chrome or Edge.')
			return
		}
		if (recognitionRef.current) return
		// one session at a time: a session another field left open is ended first
		stopActive?.()

		const listen = (lang: string, fallbackUsed: boolean) => {
			const recognition = new Ctor()
			recognition.lang = lang
			recognition.continuous = false
			recognition.interimResults = false
			recognition.maxAlternatives = 1
			let retryWithFallback = false

			recognition.onresult = (event) => {
				const text = event.results[0]?.[0]?.transcript?.trim()
				if (text) onResultRef.current(text)
			}
			recognition.onerror = (event) => {
				switch (event.error) {
					case 'aborted':
						return
					case 'not-allowed':
					case 'service-not-allowed':
						toast.error('The microphone is blocked. Allow it for this site in your browser settings (voice search also needs https or localhost).')
						return
					case 'audio-capture':
						toast.error('No microphone was found. Check that one is connected.')
						return
					case 'network':
						toast.error('Voice search needs an internet connection.')
						return
					case 'language-not-supported':
						if (!fallbackUsed) retryWithFallback = true
						else toast.error('This browser can not recognise English speech right now.')
						return
					case 'no-speech':
						toast.info('Didn’t catch that. Tap the mic and try again.')
						return
					default:
						toast.error('Voice search didn’t work. Please try again, or type your search.')
				}
			}
			recognition.onend = () => {
				recognitionRef.current = null
				if (stopActive === stopRef.current) stopActive = null
				if (retryWithFallback) {
					listen(FALLBACK_LOCALE, true)
					return
				}
				setListening(false)
			}

			try {
				recognition.start()
				recognitionRef.current = recognition
				stopRef.current = () => recognition.abort()
				stopActive = stopRef.current
				setListening(true)
			} catch {
				recognitionRef.current = null
				setListening(false)
				toast.error('Voice search didn’t start. Please try again.')
			}
		}
		listen(PREFERRED_LOCALE, false)
	}, [])

	// Leaving the page ends the session.
	useEffect(
		() => () => {
			recognitionRef.current?.abort()
			recognitionRef.current = null
		},
		[]
	)

	const toggle = useCallback(() => {
		if (recognitionRef.current) stop()
		else start()
	}, [start, stop])

	return { supported, listening, toggle }
}
