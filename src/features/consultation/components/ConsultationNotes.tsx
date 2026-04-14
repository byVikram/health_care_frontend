// src/features/consultation/components/ConsultationNotes.tsx
import { useEffect, useRef, type PointerEvent } from 'react'
import { Box, Typography, Divider, IconButton, Tooltip } from '@mui/material'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { ConsultationDoctor } from '../../../types/consultation'

interface ConsultationNotesProps {
	doctor: ConsultationDoctor
}

const TOOLBAR_ACTIONS = [
	{ icon: <UndoIcon fontSize="small" />, label: 'Undo' },
	{ icon: <RedoIcon fontSize="small" />, label: 'Redo' },
	{ icon: <TextFieldsIcon fontSize="small" />, label: 'Text' },
	{ icon: <EmojiEmotionsOutlinedIcon fontSize="small" />, label: 'Emoji' },
	{ icon: <CameraAltOutlinedIcon fontSize="small" />, label: 'Camera' },
	{ icon: <ImageOutlinedIcon fontSize="small" />, label: 'Image' },
	{ icon: <MicNoneOutlinedIcon fontSize="small" />, label: 'Voice' },
	{ icon: <FormatListBulletedIcon fontSize="small" />, label: 'List' },
]

export default function ConsultationNotes({ doctor }: ConsultationNotesProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const contextRef = useRef<CanvasRenderingContext2D | null>(null)
	const isDrawingRef = useRef(false)
	const lastPointRef = useRef<{ x: number; y: number } | null>(null)
	const undoStackRef = useRef<ImageData[]>([])
	const pendingSnapshotRef = useRef<ImageData | null>(null)

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
		undoStackRef.current = []
		pendingSnapshotRef.current = null
	}

	useEffect(() => {
		prepareCanvas()
		window.addEventListener('resize', prepareCanvas)
		return () => window.removeEventListener('resize', prepareCanvas)
	}, [])

	const getPointerPosition = (event: PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current
		if (!canvas) return null

		const rect = canvas.getBoundingClientRect()
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		}
	}

	const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
		const point = getPointerPosition(event)
		if (!point) return

		isDrawingRef.current = true
		lastPointRef.current = point
		pendingSnapshotRef.current = captureSnapshot()
		const canvas = canvasRef.current
		canvas?.setPointerCapture(event.pointerId)
	}

	const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
		if (!isDrawingRef.current) return
		const point = getPointerPosition(event)
		if (!point || !lastPointRef.current) return

		const context = contextRef.current
		if (!context) return

		if (pendingSnapshotRef.current) {
			undoStackRef.current.push(pendingSnapshotRef.current)
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
		const canvas = canvasRef.current
		canvas?.releasePointerCapture(event.pointerId)
	}

	const handleUndo = () => {
		const context = contextRef.current
		const previousSnapshot = undoStackRef.current.pop()
		if (!context || !previousSnapshot) return

		context.putImageData(previousSnapshot, 0, 0)
	}

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '16px',
				overflow: 'hidden',
				// height: '300px',
				display: 'flex',
				flexGrow: 1,
				flexDirection: 'column',
			}}
		>
			{/* Doctor + Clinic header */}
			<Box
				sx={{
					px: 2.5,
					py: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					background: '#DBE2E3',
				}}
			>
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

			{/* Toolbar */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					px: 1.5,
					py: 1,
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}
			>
				{TOOLBAR_ACTIONS.map((action, i) => (
					<Tooltip key={i} title={action.label} placement="top">
						<IconButton
							size="small"
							onClick={action.label === 'Undo' ? handleUndo : undefined}
							sx={{
								color: 'text.secondary',
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

			{/* Notes editor area */}
			<Box
				component="canvas"
				ref={canvasRef}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={stopDrawing}
				onPointerLeave={stopDrawing}
				sx={{
					flex: 1,
					width: '100%',
					border: 'none',
					outline: 'none',
					bgcolor: 'background.paper',
					cursor: 'pointer',
				}}
			/>
		</Box>
	)
}
