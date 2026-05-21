// src/features/consultation/components/ConsultationNotes.tsx
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Box, Typography, Divider, IconButton, Tooltip, TextField } from '@mui/material'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'

import { ConsultationDoctor } from '../../../types/consultation'

interface SpeechRecognitionResult {
	readonly isFinal: boolean
	readonly length: number
	[index: number]: { transcript: string; confidence: number }
}
interface SpeechRecognitionResultList {
	readonly length: number
	readonly resultIndex: number
	[index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEvent extends Event {
	readonly resultIndex: number
	readonly results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
	readonly error: string
	readonly message: string
}
interface ISpeechRecognition extends EventTarget {
	continuous: boolean
	interimResults: boolean
	lang: string
	start(): void
	stop(): void
	onresult: ((event: SpeechRecognitionEvent) => void) | null
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
	onend: (() => void) | null
}
interface ConsultationNotesProps {
	doctor: ConsultationDoctor
}
const TOOLBAR_ACTIONS = [
	{ icon: <UndoIcon fontSize="small" />, label: 'Undo' },
	{ icon: <RedoIcon fontSize="small" />, label: 'Redo' },
	{ icon: <TextFieldsIcon fontSize="small" />, label: 'Text' },
	{ icon: <CameraAltOutlinedIcon fontSize="small" />, label: 'Camera' },
	{ icon: <ImageOutlinedIcon fontSize="small" />, label: 'Image' },
	{ icon: <MicNoneOutlinedIcon fontSize="small" />, label: 'Voice' },
]

export default function ConsultationNotes({ doctor }: ConsultationNotesProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const contextRef = useRef<CanvasRenderingContext2D | null>(null)
	const isDrawingRef = useRef(false)
	const lastPointRef = useRef<{ x: number; y: number } | null>(null)
	const canvasUndoStackRef = useRef<ImageData[]>([])
	const pendingSnapshotRef = useRef<ImageData | null>(null)

	// Text history: each entry is the full transcript BEFORE a change
	const textUndoStackRef = useRef<string[]>([])
	const textRedoStackRef = useRef<string[]>([])
	// Debounce handle — groups rapid keystrokes into one undo step
	const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const [isListening, setIsListening] = useState(false)
	const [mode, setMode] = useState<'text' | 'draw'>('text')
	const [transcript, setTranscript] = useState('')
	const [liveTranscript, setLiveTranscript] = useState('')
	const recognitionRef = useRef<ISpeechRecognition | null>(null)
	const manualStopRef = useRef(false)

	const captureSnapshot = () => {
		const canvas = canvasRef.current
		const context = contextRef.current
		if (!canvas || !context) return null
		return context.getImageData(0, 0, canvas.width, canvas.height)
	}

	const prepareCanvas = () => {
		const canvas = canvasRef.current
		if (!canvas) return
		const rect = canvas.getBoundingClientRect()
		const ratio = window.devicePixelRatio || 1
		const width = Math.max(1, Math.floor(rect.width))
		const height = Math.max(1, Math.floor(rect.height))
		canvas.width = width * ratio
		canvas.height = height * ratio
		canvas.style.width = `${width}px`
		canvas.style.height = `${height}px`
		const context = canvas.getContext('2d')
		if (!context) return
		context.setTransform(ratio, 0, 0, ratio, 0, 0)
		context.lineCap = 'round'
		context.lineJoin = 'round'
		context.strokeStyle = '#0F766E'
		context.lineWidth = 2
		contextRef.current = context
		canvasUndoStackRef.current = []
		pendingSnapshotRef.current = null
	}

	useEffect(() => {
		prepareCanvas()
		window.addEventListener('resize', prepareCanvas)
		return () => {
			window.removeEventListener('resize', prepareCanvas)
			if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
		}
	}, [])

	const getPointerPosition = (event: PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current
		if (!canvas) return null
		const rect = canvas.getBoundingClientRect()
		return { x: event.clientX - rect.left, y: event.clientY - rect.top }
	}

	const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
		const point = getPointerPosition(event)
		if (!point) return
		isDrawingRef.current = true
		lastPointRef.current = point
		pendingSnapshotRef.current = captureSnapshot()
		canvasRef.current?.setPointerCapture(event.pointerId)
	}

	const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
		if (!isDrawingRef.current) return
		const point = getPointerPosition(event)
		if (!point || !lastPointRef.current) return
		const context = contextRef.current
		if (!context) return
		if (pendingSnapshotRef.current) {
			canvasUndoStackRef.current.push(pendingSnapshotRef.current)
			pendingSnapshotRef.current = null
		}
		context.beginPath()
		context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
		context.lineTo(point.x, point.y)
		context.stroke()
		lastPointRef.current = point
	}

	const stopDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
		isDrawingRef.current = false
		lastPointRef.current = null
		pendingSnapshotRef.current = null
		canvasRef.current?.releasePointerCapture(event.pointerId)
	}
	const handleUndo = () => {
		if (mode === 'draw') {
			const context = contextRef.current
			const snapshot = canvasUndoStackRef.current.pop()
			if (context && snapshot) context.putImageData(snapshot, 0, 0)
		} else {
			const prev = textUndoStackRef.current.pop()
			if (prev === undefined) return
			textRedoStackRef.current.push(transcript)
			setTranscript(prev)
			setLiveTranscript('')
		}
	}

	const handleRedo = () => {
		if (mode !== 'draw') {
			const next = textRedoStackRef.current.pop()
			if (next === undefined) return
			textUndoStackRef.current.push(transcript)
			setTranscript(next)
			setLiveTranscript('')
		}
	}

	const handleVoiceRecording = async () => {
		if (isListening) {
			manualStopRef.current = true
			if (recognitionRef.current) recognitionRef.current.onend = null
			recognitionRef.current?.stop()
			setLiveTranscript('')
			setIsListening(false)
			return
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			stream.getTracks().forEach((t) => t.stop())
		} catch {
			alert('Microphone access was denied. Please allow it in your browser settings.')
			return
		}

		const win = window as Window & {
			SpeechRecognition?: new () => ISpeechRecognition
			webkitSpeechRecognition?: new () => ISpeechRecognition
		}
		const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition
		if (!SpeechRecognitionAPI) {
			alert('Speech Recognition is not supported. Use Chrome on desktop.')
			return
		}

		const recognition = new SpeechRecognitionAPI()
		recognition.continuous = true
		recognition.interimResults = true
		recognition.lang = 'en-US'
		recognitionRef.current = recognition
		manualStopRef.current = false

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let interim = ''
			let finalText = ''
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i]
				if (result.isFinal) {
					finalText += result[0].transcript + ' '
				} else {
					interim += result[0].transcript
				}
			}
			if (finalText) {
				// Each finalized speech chunk = one discrete undo step
				setTranscript((prev) => {
					textUndoStackRef.current.push(prev)
					textRedoStackRef.current = []
					return prev + finalText
				})
			}
			setLiveTranscript(interim)
		}

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			if (event.error === 'no-speech') return
			setIsListening(false)
		}

		recognition.onend = () => {
			if (!manualStopRef.current) {
				try { recognition.start() } catch { /* silent */ }
			} else {
				setIsListening(false)
			}
		}

		recognition.start()
		setIsListening(true)
	}

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (isListening) return
		// Debounce: capture the value BEFORE this typing burst and push to undo history
		// after 800 ms of inactivity so rapid keystrokes group into one undo step.
		if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
		const valueBeforeBurst = transcript + liveTranscript
		typingDebounceRef.current = setTimeout(() => {
			textUndoStackRef.current.push(valueBeforeBurst)
			textRedoStackRef.current = []
			typingDebounceRef.current = null
		}, 800)
		setTranscript(e.target.value)
		setLiveTranscript('')
	}
	return (
		<Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
			<Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#DBE2E3' }}>
				<Box>
					<Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '14px' }}>
						{doctor.name}, {doctor.degree}
					</Typography>
					<Typography variant="body1" sx={{ color: 'primary.main', fontSize: '11px' }}>
						{doctor.specialization}
					</Typography>
				</Box>
				<Box sx={{ textAlign: 'right' }}>
					<Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '14px' }}>
						{doctor.clinicName}
					</Typography>
					<Typography variant="body1" sx={{ color: 'primary.main', fontSize: '11px' }}>
						{doctor.clinicAddress}
					</Typography>
				</Box>
			</Box>

			<Divider />

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
				{TOOLBAR_ACTIONS.map((action, i) => (
					<Tooltip key={i} title={action.label} placement="top">
						<IconButton
							size="small"
							onClick={() => {
								if (action.label === 'Undo') handleUndo()
								else if (action.label === 'Redo') handleRedo()
								else if (action.label === 'Voice') handleVoiceRecording()
								else if (action.label === 'Text') setMode('text')
								else if (action.label === 'Image') setMode('draw')
							}}
							sx={{
								color: action.label === 'Voice' && isListening ? 'error.main' : 'text.secondary',
								borderRadius: '6px',
								'&:hover': { bgcolor: 'rgba(43,111,113,0.08)', color: 'primary.main' },
								'&:focus': { outline: 'none' },
							}}
						>
							{action.icon}
						</IconButton>
					</Tooltip>
				))}
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
				<TextField
					multiline
					fullWidth
					value={transcript + liveTranscript}
					onChange={handleTextChange}
					placeholder={isListening ? 'Listening\u2026 speak now' : 'Start typing or click the mic to capture speech-to-text notes.'}
					variant="outlined"
					InputProps={{ readOnly: isListening }}
					sx={{
						flex: 1,
						'& .MuiOutlinedInput-root': {
							alignItems: 'flex-start',
							height: '100%',
							'& fieldset': { border: 'none' },
						},
						'& .MuiInputBase-input': {
							fontSize: '15px',
							lineHeight: 1.6,
							padding: '16px',
							height: '100% !important',
							overflow: 'auto !important',
						},
					}}
				/>

				{mode === 'draw' && (
					<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden', height: '250px', position: 'relative', bgcolor: '#fff' }}>
						<Typography sx={{ p: 1.5, fontWeight: 600, fontSize: '14px', color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider' }}>
							Scribble Notes
						</Typography>
						<Box
							component="canvas"
							ref={canvasRef}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={stopDrawing}
							onPointerLeave={stopDrawing}
							sx={{ width: '100%', height: '200px', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
						/>
					</Box>
				)}
			</Box>
		</Box>
	)
}