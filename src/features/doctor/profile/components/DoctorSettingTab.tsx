// src/features/doctor/profile/components/DoctorSettingTab.tsx
import { useState } from 'react'
import {Box,Typography,Button,Dialog,DialogContent,DialogActions} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { customCardStyle } from '../../../../styles/commonStyles'
import { useNavigate } from 'react-router-dom'
import ApiService from '../../../../services/apiService'
import { API_ENDPOINTS } from '../../../../constants/apiUrls'
import { clearAuth } from '../../../../hooks/useAuth'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function DoctorSettingTab() {
	const [openDialog, setOpenDialog] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const navigate = useNavigate()

	const handleDeleteClick = () => {
		setOpenDialog(true)
	}

	const handleCancel = () => {
		setOpenDialog(false)
	}

	const handleConfirmDelete = async () => {
	setIsDeleting(true)
	try {
		await ApiService.delete(API_ENDPOINTS.DOCTOR_PROFILE.DELETE_ACCOUNT)

		toast.success('Account deleted successfully')

		setOpenDialog(false)

		// 🔹 clear token/session
		clearAuth()

		// 🔹 redirect
		setTimeout(() => {
			navigate('/login', { replace: true })
		}, 1000)

	} catch (err) {
		console.error('Failed to delete account:', err)
		toast.error('Failed to delete account. Please try again.')
	} finally {
		setIsDeleting(false)
	}
}

	return (
		<Box sx={{ ...customCardStyle, p: 4 }}>
			<Typography variant="h6" fontWeight={600} sx={{ mb: 4, color: 'text.primary' }}>
				Account Settings
			</Typography>

			{/* Delete Account Button */}
			<Button
				variant="contained"
				fullWidth
				startIcon={<DeleteOutlineIcon />}
				onClick={handleDeleteClick}
				sx={{
					backgroundColor: '#e53935',
					color: '#fff',
					borderRadius: '10px',
					py: 1.5,
					fontWeight: 600,
					textTransform: 'none',
					fontSize: '1rem',
					justifyContent: 'flex-start',
					px: 3,
					'&:hover': { backgroundColor: '#c62828' },
				}}
			>
				Delete Account
			</Button>

			{/* Confirmation Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleCancel}
				PaperProps={{
					sx: {
						borderRadius: '20px',
						px: 2,
						py: 1,
						maxWidth: 360,
						width: '100%',
						textAlign: 'center',
					},
				}}
			>
				<DialogContent sx={{ pb: 1 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
						Are you sure?
					</Typography>
					<Typography variant="body2" color="text.secondary">
						You want to delete your account
					</Typography>
				</DialogContent>

				<DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, gap: 2 }}>
					{/* Cancel Button */}
					<Button
						onClick={handleCancel}
						disabled={isDeleting}
						variant="outlined"
						fullWidth
						sx={{
							borderRadius: '50px',
							borderColor: '#2e7d6b',
							color: '#2e7d6b',
							fontWeight: 600,
							textTransform: 'none',
							py: 1.2,
							'&:hover': { borderColor: '#1b5e4f', color: '#1b5e4f', backgroundColor: 'transparent' },
						}}
					>
						Cancel
					</Button>

					{/* Yes, Delete Button */}
					<Button
						onClick={handleConfirmDelete}
						disabled={isDeleting}
						variant="contained"
						fullWidth
						sx={{
							borderRadius: '50px',
							backgroundColor: '#e53935',
							color: '#fff',
							fontWeight: 600,
							textTransform: 'none',
							py: 1.2,
							'&:hover': { backgroundColor: '#c62828' },
						}}
					>
						{isDeleting ? 'Deleting...' : 'Yes, Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
