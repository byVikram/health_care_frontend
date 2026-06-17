// src/features/dashboard/ScanTypeSelectorModal.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Box,
	Typography,
	IconButton,
	CircularProgress,
	Alert,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ROUTES } from '../../constants/routes'
import { getScanTypes, ScanType } from '../radiology/radiologyService'
import allScansIcon from '../../assets/Radiology/allscans.png'
import mriIcon from '../../assets/Radiology/mri.png'
import ctIcon from '../../assets/Radiology/ct-scan.png'
import xrayIcon from '../../assets/Radiology/xray.png'
import ultrasoundIcon from '../../assets/Radiology/ultrasound.png'

interface ScanTypeSelectorModalProps {
	open: boolean
	onClose: () => void
}

interface ScanVisualConfig {
	groupKey: string
	keywords: string[]
	label: string
	icon: string
}

const SCAN_VISUAL_CONFIGS: ScanVisualConfig[] = [
	{ groupKey: 'mri',        keywords: ['mri'],                         label: 'MRI Scan',   icon: mriIcon },
	{ groupKey: 'ct',         keywords: ['ct'],                          label: 'CT Scan',    icon: ctIcon },
	{ groupKey: 'xray',       keywords: ['x-ray', 'xray'],               label: 'X-Ray',      icon: xrayIcon },
	{ groupKey: 'ultrasound', keywords: ['ultrasound', 'sono'],          label: 'Ultrasound', icon: ultrasoundIcon },
]

const DEFAULT_VISUAL: ScanVisualConfig = {
	groupKey: 'other', keywords: [], label: 'Other Scan', icon: mriIcon,
}

function resolveScanVisual(scanName: string): ScanVisualConfig {
	const lower = scanName.toLowerCase()
	return SCAN_VISUAL_CONFIGS.find((cfg) => cfg.keywords.some((kw) => lower.includes(kw))) ?? DEFAULT_VISUAL
}

interface GroupedScanType {
	groupKey: string
	label: string
	icon: string
	scanTypes: ScanType[]
}

function groupScanTypes(scanTypes: ScanType[]): GroupedScanType[] {
	const groups = new Map<string, GroupedScanType>()
	scanTypes.forEach((st) => {
		const visual = resolveScanVisual(st.name)
		const existing = groups.get(visual.groupKey)
		if (existing) {
			existing.scanTypes.push(st)
		} else {
			groups.set(visual.groupKey, {
				groupKey: visual.groupKey,
				label: visual.label,
				icon: visual.icon,
				scanTypes: [st],
			})
		}
	})
	return Array.from(groups.values())
}

// Card width matches 3-per-row grid (dialog maxWidth="sm" = 600px, padding 3 = 24px each side, gap 2 = 16px)
// ~(600 - 48 - 32) / 3 ≈ 173px — we use calc so it's fluid
const CARD_WIDTH = 'calc((100% - 32px) / 3)'

interface ScanCardProps {
	icon: string
	label: string
	onClick: () => void
}

function ScanCard({ icon, label, onClick }: ScanCardProps) {
	return (
		<Box
			onClick={onClick}
			sx={{
				width: CARD_WIDTH,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1.5,
				pt: 2.5,
				pb: 2,
				px: 1,
				borderRadius: '16px',
				cursor: 'pointer',
				border: '1.5px solid',
				borderColor: 'divider',
				aspectRatio: '1 / 1',
				transition: 'all 0.18s',
				'&:hover': {
					borderColor: 'primary.main',
					bgcolor: 'rgba(43,111,113,0.06)',
					transform: 'translateY(-2px)',
					boxShadow: '0 4px 16px rgba(43,111,113,0.12)',
				},
			}}
		>
			<Box
				sx={{
					flex: 1,
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: 0,
				}}
			>
				<img
					src={icon}
					alt={label}
					style={{
						width: '72%',
						height: '72%',
						objectFit: 'contain',
						display: 'block',
					}}
				/>
			</Box>
			<Typography
				variant="body2"
				sx={{
					fontWeight: 600,
					fontSize: '13px',
					textAlign: 'center',
					lineHeight: 1.3,
					flexShrink: 0,
				}}
			>
				{label}
			</Typography>
		</Box>
	)
}

export default function ScanTypeSelectorModal({ open, onClose }: ScanTypeSelectorModalProps) {
	const navigate = useNavigate()

	const [scanTypes, setScanTypes] = useState<ScanType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return
		let active = true
		setLoading(true)
		setError(null)

		const fetchTypes = async () => {
			try {
				const res = await getScanTypes()
				if (!active) return
				if (res.success && res.data) setScanTypes(res.data)
			} catch (err) {
				console.error('Failed to load scan types', err)
				if (!active) return
				setError('Failed to load scan types. Please try again.')
			} finally {
				if (active) setLoading(false)
			}
		}
		void fetchTypes()
		return () => { active = false }
	}, [open])

	const handleAllScans = () => {
		onClose()
		navigate(ROUTES.RADIOLOGY.SEARCH)
	}

	const handleSelect = (group: GroupedScanType) => {
		const rep = group.scanTypes[0]
		if (!rep) return
		onClose()
		navigate(
			`${ROUTES.RADIOLOGY.SEARCH}?scan_type_id=${rep.id}&scan_type_name=${encodeURIComponent(group.label)}`
		)
	}

	const groupedScanTypes = groupScanTypes(scanTypes)

	// Build rows of 3; last row is centered via justify-content
	const buildRows = () => {
		// modality cards first, All Scans last
		const cards: Array<{ key: string; icon: string; label: string; onClick: () => void }> = [
			...groupedScanTypes.map((g) => ({
				key: g.groupKey,
				icon: g.icon,
				label: g.label,
				onClick: () => handleSelect(g),
			})),
			{ key: 'all', icon: allScansIcon, label: 'All Scans', onClick: handleAllScans },
		]

		const rows: typeof cards[] = []
		for (let i = 0; i < cards.length; i += 3) {
			rows.push(cards.slice(i, i + 3))
		}
		return rows
	}

	const rows = buildRows()

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						borderRadius: '20px',
						overflow: 'hidden',
						maxHeight: '85vh',
					},
				},
			}}
		>
			{/* Header */}
			<DialogTitle
				sx={{
					bgcolor: 'primary.main',
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					py: 1.5,
					px: 2,
				}}
			>
				<IconButton size="small" onClick={onClose} sx={{ color: '#fff', mr: 0.5 }}>
					<CloseIcon fontSize="small" />
				</IconButton>
				<Typography variant="h6" fontWeight={600} fontSize={16}>
					What type of scan are you looking for?
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ px: 3, pb: 3, overflowY: 'auto', '&.MuiDialogContent-root': { pt: 3 } }}>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress sx={{ color: 'primary.main' }} />
					</Box>
				) : error ? (
					<Alert severity="error" sx={{ borderRadius: '10px' }}>
						{error}
					</Alert>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{rows.map((row, rowIdx) => (
							<Box
								key={rowIdx}
								sx={{
									display: 'flex',
									flexDirection: 'row',
									gap: 2,
									// full rows: stretch; partial last row: center
									justifyContent: row.length === 3 ? 'flex-start' : 'center',
								}}
							>
								{row.map((card) => (
									<ScanCard
										key={card.key}
										icon={card.icon}
										label={card.label}
										onClick={card.onClick}
									/>
								))}
							</Box>
						))}
					</Box>
				)}
			</DialogContent>
		</Dialog>
	)
}
