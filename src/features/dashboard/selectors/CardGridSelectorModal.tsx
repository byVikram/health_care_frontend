// src/features/dashboard/CardGridSelectorModal.tsx
import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'

export interface SelectorCardItem {
	key: string
	icon: string
	label: string
	onClick: () => void
}

interface CardGridSelectorModalProps {
	open: boolean
	onClose: () => void
	title: string
	cards: SelectorCardItem[]
	loading?: boolean
	error?: string | null
	/** Card counts per skeleton row shown while loading. Defaults to a 3-then-2 layout. */
	loadingPlaceholderRows?: number[]
}

// Card width matches 3-per-row grid (dialog maxWidth="sm" = 600px, padding 3 = 24px each side, gap 2 = 16px)
// ~(600 - 48 - 32) / 3 ≈ 173px — we use calc so it's fluid
const CARD_WIDTH = 'calc((100% - 32px) / 3)'

type SelectorCardProps = Omit<SelectorCardItem, 'key'>

function SelectorCard({ icon, label, onClick }: SelectorCardProps) {
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

function chunkIntoRows<T>(items: T[], size: number): T[][] {
	const rows: T[][] = []
	for (let i = 0; i < items.length; i += size) {
		rows.push(items.slice(i, i + size))
	}
	return rows
}

export default function CardGridSelectorModal({
	open,
	onClose,
	title,
	cards,
	loading = false,
	error = null,
	loadingPlaceholderRows = [3, 2],
}: CardGridSelectorModalProps) {
	const rows = chunkIntoRows(cards, 3)

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
					{title}
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ px: 3, pb: 3, overflowY: 'auto', '&.MuiDialogContent-root': { pt: 3 } }}>
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{loadingPlaceholderRows.map((count, rowIndex) => (
							<Box
								key={rowIndex}
								sx={{
									display: 'flex',
									gap: 2,
									justifyContent: count === 3 ? 'flex-start' : 'center',
								}}
							>
								{Array.from({ length: count }).map((_, index) => (
									<Box
										key={index}
										sx={{
											width: CARD_WIDTH,
											aspectRatio: '1 / 1',
											borderRadius: '16px',
											border: '1.5px solid',
											borderColor: 'divider',
											pt: 2.5,
											pb: 2,
											px: 1,
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
											gap: 1.5,
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
											<AppSkeleton variant="rounded" width="72%" height="72%" />
										</Box>

										<AppSkeleton variant="text" width="60%" height={24} />
									</Box>
								))}
							</Box>
						))}
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
									<SelectorCard
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
