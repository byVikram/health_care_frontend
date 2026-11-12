// src/features/consultation/components/HistoryFileDialog.tsx
//
// The dialog a history row's button opens: the record's file (a photo, or a PDF in a frame), a spinner while the link is fetched, a
// "Try again" when it could not be loaded, and "Open in new tab". Shared by the prescription and the lab report rows.

import {
	Box,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AppButton from '../../../components/common/Button/AppButton'

type Props = {
	open: boolean
	onClose: () => void
	title: string
	subtitle?: string
	url: string | null
	loading?: boolean
	failed?: boolean
	/** The file is an image (default) or a PDF, shown in a frame. */
	kind?: 'image' | 'pdf'
	/** What could not be loaded ("the prescription"), for the failure line. */
	what?: string
	onRetry?: () => void
	/** The image itself failed to load (an expired link). */
	onImageError?: () => void
}

export default function HistoryFileDialog({
	open,
	onClose,
	title,
	subtitle,
	url,
	loading = false,
	failed = false,
	kind = 'image',
	what = 'the file',
	onRetry,
	onImageError,
}: Props) {
	const showFile = !loading && !failed && !!url
	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pr: 1 }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '16px', fontWeight: 700 }} noWrap>
						{title}
					</Typography>
					{!!subtitle && (
						<Typography sx={{ fontSize: '12.5px', color: 'text.secondary', fontWeight: 400 }}>
							{subtitle}
						</Typography>
					)}
				</Box>
				<IconButton aria-label="Close" onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent
				dividers
				sx={{
					minHeight: 240,
					display: 'flex',
					justifyContent: 'center',
					alignItems: kind === 'pdf' && showFile ? 'stretch' : 'flex-start',
					bgcolor: '#fafafa',
				}}
			>
				{loading ? (
					<Box sx={{ py: 8 }}>
						<CircularProgress size={28} />
					</Box>
				) : !showFile ? (
					<Box sx={{ py: 6, textAlign: 'center' }}>
						<Typography sx={{ color: 'text.secondary', mb: 1.5 }}>Couldn’t load {what}.</Typography>
						{onRetry && (
							<AppButton variant="outlined" label="Try again" borderRadius="20px" onClick={onRetry} />
						)}
					</Box>
				) : kind === 'pdf' ? (
					<Box
						component="iframe"
						src={url ?? undefined}
						title={title}
						sx={{ width: '100%', height: '70vh', border: 0, borderRadius: '8px', backgroundColor: '#fff' }}
					/>
				) : (
					<Box
						component="img"
						src={url ?? undefined}
						alt={title}
						onError={onImageError}
						sx={{
							maxWidth: '100%',
							height: 'auto',
							objectFit: 'contain',
							borderRadius: '8px',
							backgroundColor: '#fff',
						}}
					/>
				)}
			</DialogContent>
			<DialogActions sx={{ px: 3, py: 1.5 }}>
				{showFile && (
					<Typography
						component="a"
						href={url ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.5,
							fontSize: '13px',
							fontWeight: 600,
							color: 'primary.main',
							textDecoration: 'none',
							mr: 'auto',
							'&:hover': { textDecoration: 'underline' },
						}}
					>
						<OpenInNewIcon sx={{ fontSize: 16 }} />
						Open in new tab
					</Typography>
				)}
				<AppButton variant="contained" label="Close" borderRadius="20px" onClick={onClose} />
			</DialogActions>
		</Dialog>
	)
}
