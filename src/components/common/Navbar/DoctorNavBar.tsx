// src/components/common/Navbar/DoctorNavBar.tsx
import { useState } from 'react'
import { Box, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import drImage from '../../../assets/Services/doctors-service.png'
import { useAuth } from '../../../hooks/useAuth'
import { USER_ROLES } from '../../../constants/constants'

interface DoctorNavBarProps {
	onProfileClick?: () => void
}

// Sample clinic data
interface Clinic {
	id: number
	name: string
	location: string
}

const clinics: Clinic[] = [
	{ id: 1, name: 'Arogya Clinic', location: 'K R Market' },
	{ id: 2, name: 'City Care Hospital', location: 'Indiranagar' },
	{ id: 3, name: 'Health First Clinic', location: 'Whitefield' },
	{ id: 4, name: 'MediLife Center', location: 'Koramangala' },
]

export default function DoctorNavBar({ onProfileClick }: DoctorNavBarProps) {
	const { role, user } = useAuth()

	const [selectedClinic, setSelectedClinic] = useState<Clinic>(clinics[0])
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)

	const handleClinicClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClinicClose = () => {
		setAnchorEl(null)
	}

	const handleClinicSelect = (clinic: Clinic) => {
		setSelectedClinic(clinic)
		handleClinicClose()
	}

	return (
		<Box
			sx={{
				bgcolor: '#0c7c7c',
				px: 3,
				py: 1.5,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			{/* Left: Logo + Location */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				{/* Logo */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<Typography sx={{ color: '#fff', fontWeight: 700, fontStyle: 'italic', fontSize: '18px' }}>
						Whisper ai
					</Typography>
				</Box>

				{role === USER_ROLES.DOCTOR && (
					<>
						{/* Divider */}
						<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

						{/* Location Dropdown */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								cursor: 'pointer',
								'&:hover': { opacity: 0.9 },
							}}
							onClick={handleClinicClick}
						>
							<LocationOnIcon sx={{ color: '#fff', fontSize: 16 }} />
							<Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>
								{selectedClinic.name}, {selectedClinic.location}
							</Typography>
							{clinics.length > 1 && (
								<Box
									sx={{
										bgcolor: 'rgba(255,255,255,0.2)',
										borderRadius: '10px',
										px: 0.8,
										py: 0.2,
										ml: 0.5,
									}}
								>
									<Typography sx={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>
										+{clinics.length - 1}
									</Typography>
								</Box>
							)}
							<KeyboardArrowDownIcon sx={{ color: '#fff', fontSize: 18 }} />
						</Box>

						{/* Clinics Dropdown Menu */}
						<Menu
							anchorEl={anchorEl}
							open={open}
							onClose={handleClinicClose}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							PaperProps={{
								sx: {
									mt: 1,
									minWidth: 280,
									borderRadius: 1,
									boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
									'& .MuiMenuItem-root': {
										py: 0.6,
										px: 2,
									},
								},
							}}
						>
							{clinics.map((clinic) => (
								<div key={clinic.id}>
									<MenuItem
										onClick={() => handleClinicSelect(clinic)}
										sx={{
											backgroundColor:
												selectedClinic.id === clinic.id
													? 'rgba(12, 124, 124, 0.08)'
													: 'transparent',
											'&:hover': {
												backgroundColor: 'rgba(12, 124, 124, 0.04)',
											},
										}}
									>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												width: '100%',
											}}
										>
											<Box>
												<Typography
													variant="body2"
													sx={{ fontWeight: selectedClinic.id === clinic.id ? 600 : 400 }}
												>
													{clinic.name}
												</Typography>
												<Typography
													variant="caption"
													sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
												>
													{clinic.location}
												</Typography>
											</Box>

											{selectedClinic.id === clinic.id && (
												<Box
													sx={{
														width: 8,
														height: 8,
														borderRadius: '50%',
														bgcolor: '#0c7c7c',
													}}
												/>
											)}
										</Box>
									</MenuItem>
								</div>
							))}
						</Menu>
					</>
				)}
			</Box>

			{/* Right: Calendar + Bell + Profile */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<IconButton sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} />
				</IconButton>

				<IconButton sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
				</IconButton>

				{/* Divider */}
				<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

				{/* Profile Avatar + dropdown chevron */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
						cursor: 'pointer',
						borderRadius: '20px',
						px: 0.5,
						py: 0.25,
						transition: 'background 0.15s',
						'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
					}}
					onClick={onProfileClick}
				>
					{/* Avatar with online dot */}
					<Box sx={{ position: 'relative' }}>
						<Avatar
							src={user?.avatar || drImage}
							sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.5)' }}
						/>
						<Box
							sx={{
								position: 'absolute',
								bottom: 1,
								right: 1,
								width: 9,
								height: 9,
								borderRadius: '50%',
								bgcolor: '#4caf50',
								border: '1.5px solid #0c7c7c',
							}}
						/>
					</Box>

					{/* Dropdown chevron */}
					<KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }} />
				</Box>
			</Box>
		</Box>
	)
}