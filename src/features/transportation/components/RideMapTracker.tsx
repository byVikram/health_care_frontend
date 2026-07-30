import { useEffect, useState } from 'react'
import { Box } from '@mui/material'

interface RideMapTrackerProps {
	status: string // 'scheduled' | 'requesting' | 'dispatched' | 'in_transit' | 'completed'
	pickupLabel: string
	dropoffLabel: string
}

export default function RideMapTracker({ status, pickupLabel, dropoffLabel }: RideMapTrackerProps) {
	const [carPosition, setCarPosition] = useState(0) // percentage along the path

	useEffect(() => {
		if (status === 'in_transit') {
			const interval = setInterval(() => {
				setCarPosition((prev) => {
					if (prev >= 100) return 0
					return prev + 2
				})
			}, 150)
			return () => clearInterval(interval)
		} else if (status === 'completed') {
			setCarPosition(100)
		} else if (status === 'dispatched') {
			setCarPosition(0)
		} else {
			setCarPosition(0)
		}
	}, [status])

	return (
		<Box sx={{ width: '100%', mb: 2 }}>
			<Box
				sx={{
					width: '100%',
					height: 180,
					borderRadius: '16px',
					bgcolor: '#e0f2f1',
					position: 'relative',
					overflow: 'hidden',
					border: '1.5px solid',
					borderColor: 'divider',
					boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						top: '30%',
						left: 0,
						right: 0,
						height: 12,
						bgcolor: '#fff',
						transform: 'rotate(-5deg)',
						zIndex: 1
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: '40%',
						width: 14,
						bgcolor: '#fff',
						transform: 'rotate(15deg)',
						zIndex: 1
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						top: '15%',
						left: '15%',
						width: 45,
						height: 35,
						bgcolor: '#b2dfdb',
						borderRadius: '8px',
						zIndex: 0
					}}
				/>

				<svg
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						zIndex: 2,
						pointerEvents: 'none'
					}}
				>
					<path
						id="route-path"
						d="M 40,120 Q 120,60 220,120 T 320,60"
						fill="none"
						stroke="#0c7c7c"
						strokeWidth="5"
						strokeLinecap="round"
						strokeDasharray={status === 'requesting' ? '8 8' : 'none'}
						style={{
							transition: 'all 0.5s ease',
							animation: status === 'requesting' ? 'dash 1.5s linear infinite' : 'none'
						}}
					/>
				</svg>

				<Box
					sx={{
						position: 'absolute',
						left: 32,
						top: 104,
						zIndex: 3,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Box
						sx={{
							bgcolor: '#00796b',
							color: '#fff',
							px: 1,
							py: 0.25,
							borderRadius: '4px',
							fontSize: 9,
							fontWeight: 700,
							whiteSpace: 'nowrap',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}}
					>
						{pickupLabel}
					</Box>
					<Box sx={{ width: 8, height: 8, bgcolor: '#00796b', borderRadius: '50%', border: '2px solid #fff', mt: 0.25 }} />
				</Box>

				<Box
					sx={{
						position: 'absolute',
						left: 312,
						top: 44,
						zIndex: 3,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Box
						sx={{
							bgcolor: '#d32f2f',
							color: '#fff',
							px: 1,
							py: 0.25,
							borderRadius: '4px',
							fontSize: 9,
							fontWeight: 700,
							whiteSpace: 'nowrap',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}}
					>
						{dropoffLabel}
					</Box>
					<Box sx={{ width: 8, height: 8, bgcolor: '#d32f2f', borderRadius: '50%', border: '2px solid #fff', mt: 0.25 }} />
				</Box>

				{status !== 'scheduled' && status !== 'requesting' && (
					<Box
						sx={{
							position: 'absolute',
							zIndex: 4,
							width: 24,
							height: 24,
							bgcolor: '#fff',
							borderRadius: '50%',
							boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 14,
							...calculateCoordinates(carPosition),
							transform: 'translate(-50%, -50%)',
							transition: status === 'in_transit' ? 'none' : 'all 0.5s ease-out'
						}}
					>
						🚗
					</Box>
				)}
			</Box>

			<style dangerouslySetInnerHTML={{__html: `
				@keyframes dash {
					to {
						stroke-dashoffset: -16;
					}
				}
			`}} />
		</Box>
	)
}

function calculateCoordinates(pct: number) {
	const t = pct / 100
	let x = 0
	let y = 0

	if (t <= 0.5) {
		const segmentT = t * 2
		const x0 = 40, y0 = 120
		const x1 = 120, y1 = 60
		const x2 = 220, y2 = 120

		x = (1 - segmentT) * (1 - segmentT) * x0 + 2 * (1 - segmentT) * segmentT * x1 + segmentT * segmentT * x2
		y = (1 - segmentT) * (1 - segmentT) * y0 + 2 * (1 - segmentT) * segmentT * y1 + segmentT * segmentT * y2
	} else {
		const segmentT = (t - 0.5) * 2
		const x0 = 220, y0 = 120
		const x1 = 270, y1 = 180
		const x2 = 320, y2 = 60

		x = (1 - segmentT) * (1 - segmentT) * x0 + 2 * (1 - segmentT) * segmentT * x1 + segmentT * segmentT * x2
		y = (1 - segmentT) * (1 - segmentT) * y0 + 2 * (1 - segmentT) * segmentT * y1 + segmentT * segmentT * y2
	}

	return {
		left: `${x}px`,
		top: `${y}px`
	}
}
