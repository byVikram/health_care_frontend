// src/features/patient/profile/components/PatientSettingTab.tsx

import { useState } from 'react'
import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogContent,
	DialogActions,
	Divider,
} from '@mui/material'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { customCardStyle } from '../../../styles/commonStyles'
import { useNavigate } from 'react-router-dom'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppSwitch from '../../../components/common/Switch/AppSwitch'

export default function PatientSettingTab() {
	const [openDialog, setOpenDialog] = useState(false)

	const navigate = useNavigate()

	// Notification toggles
	const [notifyAppointmentReminder, setNotifyAppointmentReminder] = useState(true)

	const [notifyDoctorUpdates, setNotifyDoctorUpdates] = useState(false)

	const [notifyOffers, setNotifyOffers] = useState(true)

	const handleDeleteClick = () => setOpenDialog(true)

	const handleCancel = () => setOpenDialog(false)

	const handleConfirmDelete = () => {
		toast.success('Account deleted successfully')

		setOpenDialog(false)

		navigate('/login')
	}

	const infoRows = [
		{
			icon: <InfoOutlinedIcon sx={{ fontSize: 20, color: '#2B6F71' }} />,
			label: 'About Whisper ai',
		},

		{
			icon: <StarBorderIcon sx={{ fontSize: 20, color: '#2B6F71' }} />,
			label: 'Rate us on app store',
		},

		{
			icon: <ShareOutlinedIcon sx={{ fontSize: 20, color: '#2B6F71' }} />,
			label: 'Share the app with family & friends',
		},
	]

	const notifRows = [
		{
			label: 'Get reminders for upcoming appointments',
			value: notifyAppointmentReminder,
			setter: setNotifyAppointmentReminder,
		},

		{
			label: 'Get notified when appointment status changes',
			value: notifyDoctorUpdates,
			setter: setNotifyDoctorUpdates,
		},

		{
			label: 'Receive health tips and wellness update',
			value: notifyOffers,
			setter: setNotifyOffers,
		},
	]

	return (
		<Box sx={{ ...customCardStyle, p: 4 }}>
			<Typography
				variant="h6"
				fontWeight={600}
				sx={{
					mb: 3,
					color: 'text.primary',
				}}
			>
				Account Settings
			</Typography>

			{/* ── Info Rows ── */}

			<Box
				sx={{
					border: '1px solid #EAECF0',
					borderRadius: '12px',
					overflow: 'hidden',
					mb: 3,
				}}
			>
				{infoRows.map((row, i) => (
					<Box key={row.label}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								px: 2.5,
								py: 1.8,
								cursor: 'pointer',
								transition: 'background 0.15s',

								'&:hover': {
									backgroundColor: 'rgba(43,111,113,0.04)',
								},
							}}
						>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1.5,
								}}
							>
								{row.icon}

								<Typography
									sx={{
										fontSize: '14px',
										color: 'text.primary',
										fontWeight: 450,
									}}
								>
									{row.label}
								</Typography>
							</Box>

							<ChevronRightIcon
								sx={{
									fontSize: 18,
									color: '#9CA3AF',
								}}
							/>
						</Box>

						{i < infoRows.length - 1 && <Divider />}
					</Box>
				))}
			</Box>

			{/* ── Notification Settings ── */}

			<Typography
				variant="subtitle2"
				fontWeight={600}
				sx={{
					mb: 1.5,
					color: 'text.primary',
					fontSize: '14px',
				}}
			>
				Notification Settings
			</Typography>

			<Box
				sx={{
					border: '1px solid #EAECF0',
					borderRadius: '12px',
					overflow: 'hidden',
					mb: 3,
				}}
			>
				{notifRows.map((row, i) => (
					<Box key={row.label}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								px: 2.5,
								py: 1.8,
								gap: 2,
							}}
						>
							<Typography
								sx={{
									fontSize: '14px',
									color: 'text.primary',
									fontWeight: 450,
									flex: 1,
								}}
							>
								{row.label}
							</Typography>

							<AppSwitch
								checked={row.value}
								onChange={(e) => row.setter(e.target.checked)}
							/>
						</Box>

						{i < notifRows.length - 1 && <Divider />}
					</Box>
				))}
			</Box>

			{/* ── Deactivate Account ── */}

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

					'&:hover': {
						backgroundColor: '#c62828',
					},
				}}
			>
				Deactivate the Account
			</Button>

			{/* ── Confirmation Dialog ── */}

			<Dialog
				open={openDialog}
				onClose={handleCancel}
				slotProps={{
					paper: {
						sx: {
							borderRadius: '20px',
							px: 2,
							py: 1,
							maxWidth: 360,
							width: '100%',
							textAlign: 'center',
						},
					},
				}}
			>
				<DialogContent sx={{ pb: 1 }}>
					<Typography
						variant="h6"
						fontWeight={700}
						sx={{ mb: 1 }}
					>
						Are you sure?
					</Typography>

					<Typography
						variant="body2"
						color="text.secondary"
					>
						You want to delete your account
					</Typography>
				</DialogContent>

				<DialogActions
					sx={{
						justifyContent: 'space-between',
						px: 3,
						pb: 3,
						gap: 2,
					}}
				>
					<Button
						onClick={handleCancel}
						variant="outlined"
						fullWidth
						sx={{
							borderRadius: '50px',
							borderColor: '#2e7d6b',
							color: '#2e7d6b',
							fontWeight: 600,
							textTransform: 'none',
							py: 1.2,

							'&:hover': {
								borderColor: '#1b5e4f',
								color: '#1b5e4f',
								backgroundColor: 'transparent',
							},
						}}
					>
						Cancel
					</Button>

					<Button
						onClick={handleConfirmDelete}
						variant="contained"
						fullWidth
						sx={{
							borderRadius: '50px',
							backgroundColor: '#e53935',
							color: '#fff',
							fontWeight: 600,
							textTransform: 'none',
							py: 1.2,

							'&:hover': {
								backgroundColor: '#c62828',
							},
						}}
					>
						Yes, Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}