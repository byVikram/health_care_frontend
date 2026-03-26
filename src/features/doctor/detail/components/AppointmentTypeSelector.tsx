// src/features/doctor/components/AppointmentTypeSelector.tsx
import { Box, Typography } from '@mui/material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import VideocamIcon from '@mui/icons-material/Videocam'
import { AppointmentType } from '../../../../types/doctor'

interface AppointmentTypeSelectorProps {
	types: AppointmentType[]
	selected: 'clinic' | 'video'
	onChange: (id: 'clinic' | 'video') => void
}

const iconMap = {
	clinic: <LocalHospitalIcon fontSize="small" />,
	video: <VideocamIcon fontSize="small" />,
}

const iconBgMap = {
	clinic: '#e8f5e9',
	video: '#e3f2fd',
}

const iconColorMap = {
	clinic: '#2e7d32',
	video: '#1565c0',
}

export default function AppointmentTypeSelector({ types, selected, onChange }: AppointmentTypeSelectorProps) {
	return (
		<Box>
			<Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
				Type of Appointment
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				{types.map((type) => {
					const isSelected = selected === type.id
					return (
						<Box
							key={type.id}
							onClick={() => onChange(type.id)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								p: 1,
								border: '1.5px solid',
								borderColor: isSelected ? 'primary.main' : 'divider',
								borderRadius: '12px',
								cursor: 'pointer',
								bgcolor: isSelected ? 'rgba(43,111,113,0.05)' : 'background.paper',
								transition: 'all 0.15s',
								'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.04)' },
							}}
						>
							{/* Icon */}
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: '10px',
									bgcolor: iconBgMap[type.id],
									color: iconColorMap[type.id],
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{iconMap[type.id]}
							</Box>

							{/* Info */}
							<Box sx={{ flex: 1 }}>
								<Typography variant="body1" sx={{ fontWeight: 600 }}>
									{type.label}
								</Typography>
								<Typography variant="body2">{type.description}</Typography>
							</Box>

							{/* Price + Duration */}
							<Box sx={{ textAlign: 'right', flexShrink: 0 }}>
								<Typography variant="body1" sx={{ fontWeight: 700 }}>
									₹ {type.price}
								</Typography>
								<Typography variant="body2" sx={{ fontSize: '11px' }}>
									{type.duration} min
								</Typography>
							</Box>

							{/* Radio dot */}
							<Box
								sx={{
									width: 18,
									height: 18,
									borderRadius: '50%',
									border: '2px solid',
									borderColor: isSelected ? 'primary.main' : 'divider',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{isSelected && (
									<Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'primary.main' }} />
								)}
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
