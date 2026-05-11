// src/components/common/Modal/AppModal.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ReactNode } from 'react'

interface AppModalProps {
	open: boolean
	onClose: () => void
	title?: string
	children?: ReactNode
	actions?: ReactNode
	maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	fullWidth?: boolean
	showCloseButton?: boolean
	disableScroll?: boolean
}

export default function AppModal({
	open,
	onClose,
	title,
	children,
	actions,
	maxWidth = 'xs',
	fullWidth = true,
	showCloseButton = true,
	disableScroll = false,
}: AppModalProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={maxWidth}
			fullWidth={fullWidth}
			PaperProps={{
				sx: {
					borderRadius: '12px',
					overflow: disableScroll ? 'hidden' : undefined,
				},
			}}
		>
			{(title || showCloseButton) && (
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						py: 1.25,
						px: 2,
						borderBottom: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px' }}>
						{title}
					</Typography>
					{showCloseButton && (
						<IconButton
							onClick={onClose}
							size="small"
							sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					)}
				</DialogTitle>
			)}

			<DialogContent
				sx={{
					pt: '14px !important',
					px: 2,
					pb: 1,
					overflow: disableScroll ? 'hidden' : undefined,
				}}
			>
				{children}
			</DialogContent>

			{actions && (
				<DialogActions sx={{ px: 2, pb: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
					{actions}
				</DialogActions>
			)}
		</Dialog>
	)
}
