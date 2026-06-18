import { ReactNode } from 'react'
import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AppButton from '../Button/AppButton'

type AppDrawerProps = {
	/** Controls drawer visibility */
	open: boolean
	/** Called when the drawer requests to close (backdrop click, Esc, header X, Cancel button) */
	onClose: () => void

	/** Main heading shown in the header, e.g. "Reschedule Appointment" */
	title: string
	/** Optional secondary line under the title, e.g. patient name */
	subtitle?: string

	/** Scrollable body content — the part that differs per drawer (form fields, pickers, etc.) */
	children: ReactNode

	/** Label for the secondary/dismiss footer button. Defaults to "Cancel". */
	cancelLabel?: string
	/** Label for the primary footer action button. Defaults to "Confirm". */
	confirmLabel?: string
	/** Called when the primary footer button is clicked */
	onConfirm: () => void
	/** Shows a loading spinner on the primary button and disables it while true */
	confirmLoading?: boolean
	/** Disables the primary button independent of loading state (e.g. validation gating). Defaults to false. */
	confirmDisabled?: boolean

	/** Drawer width on sm+ breakpoints. Defaults to 400 to match existing drawers. */
	width?: number
}

export default function AppDrawer({
	open,
	onClose,
	title,
	subtitle,
	children,
	cancelLabel = 'Cancel',
	confirmLabel = 'Confirm',
	onConfirm,
	confirmLoading = false,
	confirmDisabled = false,
	width = 400,
}: AppDrawerProps) {
	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: {
						width: { xs: '100%', sm: width },
						borderRadius: '16px',
						m: 2,
						height: 'calc(100% - 32px)',
						p: 0,
						display: 'flex',
						flexDirection: 'column',
						boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
					},
				},
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 3,
					py: 2,
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Box>
					<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>
						{title}
					</Typography>
					{subtitle ? (
						<Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.3 }}>
							{subtitle}
						</Typography>
					) : null}
				</Box>
				<IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			{/* Body — scrollable */}
			<Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>{children}</Box>

			{/* Footer */}
			<Box
				sx={{
					px: 3,
					py: 2,
					borderTop: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					gap: 1.5,
				}}
			>
				<AppButton
					label={cancelLabel}
					variant="outlined"
					fullWidth
					onClick={onClose}
					sx={{
						borderRadius: '20px',
						color: 'text.secondary',
						borderColor: 'divider',
						'&:hover': {
							bgcolor: 'action.hover',
							borderColor: 'divider',
						},
					}}
				/>

				<AppButton
					label={confirmLabel}
					fullWidth
					loading={confirmLoading}
					disabled={confirmDisabled}
					onClick={onConfirm}
					sx={{ borderRadius: '20px' }}
				/>
			</Box>
		</Drawer>
	)
}
