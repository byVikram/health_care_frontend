// src/features/doctor/components/DoctorProfileCard.tsx
import { useState } from 'react'
import { customCardStyle } from '../../../../styles/commonStyles'
import { Box, Typography, Avatar, Chip, Divider, IconButton, Snackbar, Tooltip } from '@mui/material'
import { LuMapPin } from 'react-icons/lu'
import { BsBriefcase, BsPatchCheckFill, BsCalendarCheck } from 'react-icons/bs'


import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import { DoctorDetailData } from '../../../../types/doctor-detail'

interface StatItemProps {
	icon: React.ReactNode
	value: string | number
	label: string
}

function StatItem({ icon, value, label }: StatItemProps) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
			<Box
				sx={{
					width: 42,
					height: 42,
					// borderRadius: 1,
					// bgcolor: '#E9EFEF',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'primary.main',
				}}
			>
				{icon}
			</Box>
			<Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px' }}>
				{value}
			</Typography>
			<Typography variant="body2">{label}</Typography>
		</Box>
	)
}

interface DoctorProfileCardProps {
	doctor: DoctorDetailData
}

export default function DoctorProfileCard({ doctor }: DoctorProfileCardProps) {
	const [isFavourited, setIsFavourited] = useState(false)
	const [snackbarOpen, setSnackbarOpen] = useState(false)
	const [snackbarMsg, setSnackbarMsg] = useState('')
	const specialization = doctor.specialities?.[0] || 'General'
	const primaryHospital =
		doctor.hospitals.find((h) => h.is_primary) || (doctor.hospitals.length > 0 ? doctor.hospitals[0] : null)
	const secondaryHospital = doctor.hospitals.find((h) => h.id !== primaryHospital?.id) || null

	const handleFavourite = () => {
		setIsFavourited((prev) => !prev)
		setSnackbarMsg(!isFavourited ? 'Added to favourites' : 'Removed from favourites')
		setSnackbarOpen(true)
	}

	const handleShare = () => {
		const url = `${window.location.origin}/doctors/${doctor.id}`
		navigator.clipboard.writeText(url).then(() => {
			setSnackbarMsg('Link copied to clipboard!')
			setSnackbarOpen(true)
		})
	}

	return (
		<>
			<Box
				sx={{
					...customCardStyle,
					overflow: 'hidden',
				}}
			>
				{/* Top: Avatar + Info */}
				<Box sx={{ display: 'flex', gap: 2.5, p: 1, alignItems: 'flex-start' }}>
					<Avatar
						src={doctor.details.avatar_s3_key || ''}
						alt={doctor.name}
						sx={{ width: 88, height: 88, borderRadius: '50%', flexShrink: 0 }}
						variant="rounded"
					/>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						{/* Name row: name on left, ID chip + icons on right */}
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
							<Typography variant="h5" sx={{ fontWeight: 700 }}>
								{doctor.name}
							</Typography>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

								{/* Heart Icon */}
								<Tooltip title={isFavourited ? 'Remove from favourites' : 'Add to favourites'}>
									<IconButton
										size="small"
										onClick={handleFavourite}
										sx={{
											color: isFavourited ? 'error.main' : 'text.secondary',
											transition: 'color 0.2s, transform 0.15s',
											'&:hover': { transform: 'scale(1.15)' },
											'&:focus': { outline: 'none' },
											p: 0.5,
										}}
									>
										{isFavourited ? (
											<FavoriteIcon sx={{ fontSize: 20 }} />
										) : (
											<FavoriteBorderIcon sx={{ fontSize: 20 }} />
										)}
									</IconButton>
								</Tooltip>

								{/* Share Icon */}
								<Tooltip title="Copy profile link">
									<IconButton
										size="small"
										onClick={handleShare}
										sx={{
											color: 'text.secondary',
											transition: 'color 0.2s, transform 0.15s',
											'&:hover': { color: 'primary.main', transform: 'scale(1.15)' },
											'&:focus': { outline: 'none' },
											p: 0.5,
										}}
									>
										<ShareIcon sx={{ fontSize: 20 }} />
									</IconButton>
								</Tooltip>
							</Box>
						</Box>

						<Typography variant="body2" sx={{ mb: 1 }}>
							{specialization}
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								{/* <LocationOnIcon sx={{ fontSize: 14, color: 'primary.main' }} /> */}
								<LuMapPin style={{ fontSize: 14, color: 'primary.main' }} />

								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{primaryHospital?.hospital.name || doctor.details.location || 'Clinic'}
								</Typography>
								<Typography
									variant="caption"
									sx={{ color: 'primary.main', fontWeight: 600, fontSize: '11px', ml: 0.5 }}
								>
									&lt;{primaryHospital?.hospital.distance || '0 km'}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								{/* <LocationOnIcon sx={{ fontSize: 14, color: 'primary.main' }} /> */}
								<LuMapPin style={{ fontSize: 14, color: 'primary.main' }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{secondaryHospital?.hospital.name || ''}
								</Typography>
								<Typography
									variant="caption"
									sx={{ color: 'primary.main', fontWeight: 600, fontSize: '11px', ml: 0.5 }}
								>
									{secondaryHospital ? `<${secondaryHospital.hospital.distance}` : ''}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>

				<Divider />

				{/* Stats Row */}
				<Box sx={{ display: 'flex', justifyContent: 'space-around', py: 2.5, px: 2 }}>
					<StatItem
						icon={<BsCalendarCheck style={{ width: 24, height: 24 }} />}
						value="Today"
						label="Available"
					/>
					<Divider orientation="vertical" flexItem />
					<StatItem
						icon={<BsBriefcase style={{ width: 24, height: 24 }} />}
						value={`${doctor.details.experience_years || 0}+`}
						label="Experience"
					/>
				</Box>
			</Box>

			{/* Snackbar feedback */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={2000}
				onClose={() => setSnackbarOpen(false)}
				message={snackbarMsg}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			/>
		</>
	)
}
