// src/components/common/ProfileFormActions/ProfileFormActions.tsx
import { Box, Snackbar, Alert } from '@mui/material'
import AppButton from '../Button/AppButton'

interface ProfileFormActionsProps {
	isDirty: boolean
	showSuccess: boolean
	onSave: () => void
	onCloseSnackbar: () => void
	saveLabel?: string
}

export default function ProfileFormActions({
	isDirty,
	showSuccess,
	onSave,
	onCloseSnackbar,
	saveLabel = 'Save',
}: ProfileFormActionsProps) {
	return (
		<>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
				<AppButton variant="contained" disabled={!isDirty} label={saveLabel} onClick={onSave}></AppButton>
			</Box>

			<Snackbar
				open={showSuccess}
				autoHideDuration={3000}
				onClose={onCloseSnackbar}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					onClose={onCloseSnackbar}
					severity="success"
					variant="filled"
					sx={{ borderRadius: '10px', fontWeight: 500 }}
				>
					Changes saved successfully!
				</Alert>
			</Snackbar>
		</>
	)
}
