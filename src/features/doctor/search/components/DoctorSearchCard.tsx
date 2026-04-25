// src/features/doctor/components/DoctorSearchCard.tsx
import { Box, Typography, Avatar } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import WorkIcon from '@mui/icons-material/Work'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AppButton from '../../../../components/common/Button/AppButton'
import { DoctorSearchItem } from '../../../../types/doctor-search'
import { useNavigate } from 'react-router-dom'

interface DoctorSearchCardProps {
	doctor: DoctorSearchItem
	recommended?: boolean
}

export default function DoctorSearchCard({ doctor }: DoctorSearchCardProps) {
	const navigate = useNavigate()
	const specialization = doctor.specialities?.[0] || 'General'
	const avatar = doctor.avatar_s3_key || ''
	const clinicName = doctor.location || 'Clinic'
	const experience = doctor.experience_years || 0

	const handleCardClick = () => {
		navigate(`/doctors/${doctor.id}`)
	}

	return (
		<Box
			onClick={handleCardClick}
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '8px',
				overflow: 'hidden',
				cursor: 'pointer',
				transition: 'box-shadow 0.2s, transform 0.2s',
				'&:hover': {
					boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
					transform: 'translateY(-2px)',
				},
			}}
		>
			{/* Image area */}
			<Box sx={{ position: 'relative', height: 160 }}>
				<Avatar
					src={avatar}
					alt={doctor.name}
					variant="square"
					sx={{
						width: '100%',
						height: '100%',
						m: 'auto',
						'& img': { objectFit: 'cover', objectPosition: 'top', height: '100%' },
					}}
				/>
			</Box>

			{/* Info area */}
			<Box sx={{ p: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2 }}>
					{doctor.name}
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', mb: 1 }}>
					{specialization}
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', mb: 1.5 }}>
					Earliest available slot (Today 2:00 PM)
				</Typography>

				{/* Experience + Rating row */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<WorkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							{experience} yrs exp
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
							0
						</Typography>
						<StarIcon sx={{ fontSize: 13, color: '#f5a623' }} />
					</Box>
				</Box>

				{/* Clinic + Distance row */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
						<LocationOnIcon sx={{ fontSize: 13, color: 'primary.main' }} />
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							{clinicName}
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '11px' }}>
						&lt;0 km
					</Typography>
				</Box>

				{/* Book Now */}
				<AppButton
					label="Book Now"
					fullWidth
					onClick={(e) => {
						e.stopPropagation()
						navigate(`/doctors/${doctor.id}`)
					}}
					sx={{ borderRadius: '10px', py: 0.8 }}
				/>
			</Box>
		</Box>
	)
}
